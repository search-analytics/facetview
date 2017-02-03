from __future__ import absolute_import

import tika
from tika import parser
from tika import detector
from boto.s3.connection import S3Connection
from boto.s3.key import Key
import nltk
from nltk import RegexpParser
import os
import csv
import subprocess
from tika import config
import json
import heapq
import re
from textblob import TextBlob
from textblob.classifiers import NaiveBayesClassifier
import binascii
import operator
from elasticsearch import Elasticsearch, helpers
from pyelasticsearch import ElasticSearch as Elastic
import gensim
from bow import BagOfWords
from collections import Counter

# from nltk.tag.stanford import NERTagger

# LDA dependencies
import time
import logging
import shutil
import webbrowser
import numpy as np
from topik.readers import iter_elastic_query
from topik.tokenizers import EntitiesTokenizer
from topik.vectorizers import CorpusBOW
from topik.models import LDA
from topik.viz import Termite
from topik.utils import to_r_ldavis, generate_csv_output_file


exclude_hist_values = ["none", "earth", "figure","fig", "nasa", "decadal_survey", "global", "furthermore", "utility", "theme", "measurement",
"resources", "measurements", "working", "summary", "rfi", "quality", "applications", "information", "white_paper", "current", "objective",
"key","u_s", "application_targets", "application_target", "nasa_u_e_u_u_s", "earth_u_e_u_u_s", "importance", "requirements", 
"understanding", "application", "recent", "n_n", "n_n_n", "science_objectives", "observing", "studies", "n_nthe", "additional", "nasa_earth",
"target","observations", "science target", "similarly", "likelihood", "minutes", "decadal_timeframe", "science_community", "n_nutility",
"white papers", "significant", "science_questions", "research_center", "science_community", "science_targets"]

#CLEANUP / TODOs
#-----------------

#if/else in force_directed_nodes() and force_directed_links() are unnecessarily long (should be a function (repeated code))
#standard parsing should be incorporated, not just reading exsiting index or bulk-formatted file
#coding bullshit, when fully automated, need to add try + except with a lot of different formats for json.loads
#change where people.json is being put (force-directed output), currently need to move it

#need to create "new" and "original" folders in "elastic" directory
#title mapping needs to be not_analyzed

tika.initVM()

BASEDIR = os.path.abspath(os.path.dirname(__file__))

# elastic = "/users/hundman/documents/data_science/facetview-general/static/CUSTOM/elastic/"
elastic = "/users/hundman/documents/data_science/facetview/es_parsers_indices/decadal_survey2/index/"
# elastic_endpoint = 'http://search-hyspiri-usewpxxqltz2vmfgyqg2zglosi.us-west-2.es.amazonaws.com/'
elastic_endpoint = 'http://52.88.221.163:9200/'
# elastic_endpoint = 'http://localhost:9200/'

lda_output = os.path.join(BASEDIR, "lda_output")

# index = 'agu_dsi_test2'
index = 'ds2'
# mapping_file = "agu_dsi_map"
mapping_file = "ds_map"
authors_field = "all_authors" #field should be type = list
lda_content_fields = ["description","content", "title"]
num_topics = 15
title_field = "title" #for similar docs
cat_index = False
cat_lookup = {}
#add more variables to work with in force-directed (affiliation)
#Force directed for terms
#make a class so self.vars can be set up front (without digging through functions)
#Make functions out of last bit of code

#faster way to get keywords? right now retokenizing and looking up in lda output
    # load in dictionary?
#Need to build connector for Tika output (throw any doc at it)
#build gui for file upload


def tika_parse(_dir):
    # grobid = subprocess.Popen("cd /users/hundman/src/grobid/grobid-service && mvn -Dmaven.test.skip=true jetty:run-war", shell=True)
    # folderPath = path of the folder you want to run mvn clean install on
    # with changeDir(""):
        # ****** NOTE ******: using shell=True is strongly discouraged since it possesses security risks
        # subprocess.Popen(["/users/hundman/src/apache-maven-3.3.3/bin/mvn", "-Dmaven.test.skip=true", "jetty:run-war"])
        # os.system("cd $HOME/src/grobid/grobid-service && /users/hundman/src/apache-maven-3.3.3/bin/mvn -Dmaven.test.skip=true jetty:run-war")
    # lsof -t -i tcp:8080 | xargs kill
    os.system("cd /users/hundman/src/grobid/grobid-service && mvn -Dmaven.test.skip=true jetty:run-war &")
    time.sleep(15)
    for file in os.listdir(_dir):
        if not ".DS_Store" in file:
            # to run grobid with Tika - https://wiki.apache.org/tika/GrobidJournalParser
            # subprocess.call('cd $HOME/src/grobid/grobid-service', shell=True)
            process_with_tika = subprocess.check_output(["java", "-classpath", 
                "/users/hundman/src/grobidparser-resources/:/users/hundman/src/tika-1.11/tika-app/target/tika-app-1.11.jar",
                 "org.apache.tika.cli.TikaCLI", "--config=/users/hundman/src/grobidparser-resources/tika-config.xml", "-J", 
                 "%s/%s" %(_dir,file)])
            print re.sub("\d(,\d)*", "::", eval(process_with_tika)[0]["grobid:header_Authors"]).split("::") # trim list items
    # see if anything is running on 8080 -> lsof -t -i:8080
    os.system("kill `lsof -t -i:8080`")
    # grobid.terminate()

# tika_parse("/users/hundman/documents/data_science/facetview-general/test_docs")

def classifier(dir, _iter, type=None):
    """Filenames = category names(replace spaces with underscores"""
    global cat_lookup
    global cat_index
    doc = EntitiesTokenizer(_iter)
    doc_bow = CorpusBOW(doc)
    if not cat_index:
        cnt = 0
        raw_texts = []
        for file in os.listdir(dir):
            if not ".DS_Store" in file:
                cat_lookup[cnt] = file.replace("_", " ")
                cnt += 1
                text = open(dir + file,"r")
                raw_texts.append(''.join([line.strip().decode("utf8").encode("ascii","ignore") for line in text.readlines()]))
        corpus = EntitiesTokenizer(iter(raw_texts))
        corpus_bow = CorpusBOW(corpus)
        corpus_file = corpus_bow.serialize(os.path.join(lda_output, 'cat_corpus.mm'))
        corpusMM = gensim.corpora.MmCorpus(os.path.join(lda_output, 'cat_corpus.mm'))
        cat_index = gensim.similarities.docsim.Similarity(lda_output, corpusMM, num_features=corpusMM.num_terms) # build the index
    return cat_lookup[np.argmax(cat_index[doc_bow][0])]
    # return len(cat_index[doc_bow][0])




def read_bulk_index(location, content_fields=None, field_filters=None, field_filter_vals=None):
    """
    location: directory where file "full_index" resides (multiple are created throughout script)
    content_field: field to be tokenized for lda modeling. If =None the dictionary of all fields will be returned (useful in other functions)
    field_filter: if only going to use subset of docs for lda, specify field to filter docs based on
    field_filter_val: specify value of field_filter - docs that match this value are used

    required directories -> elastic/original, elastic/temp
    """
    lda_content = []
    print location

    if not os.path.isfile(location + "full_index"): 
        with open(location + "full_index", "w") as combined:
            for file in os.listdir( location):
                if "index" in file:
                    with open(location + file, "r") as block:
                        reader = block.readlines()
                        for line in reader:
                            combined.write(line)
            combined.write("\n") #bulk api format requires new line at end of file
    with open(location + "full_index", "r") as index:
        index = index.readlines()
        cnt = 1
        errors = 0
        for doc in index:
            dict = json.loads(doc, encoding="latin1")
            if content_fields != None:
                if cnt % 2 == 0:
                    if field_filters == None: # Need to fix this so it isn't dependent on content_fields
                        combined_content = ""
                        for field in content_fields:
                            combined_content += " " + json.dumps(dict[field]) 
                        lda_content.append(combined_content)
                    else:
                        for x in range(0,len(field_filters)):
                            if dict[field_filters[x]] == field_filter_vals[x]:
                                combined_content = ""
                                for field in content_fields:
                                    combined_content += " " + json.dumps(dict[field])
                                lda_content.append(combined_content)
            else:
                lda_content.append(dict)
            cnt += 1
    for j in lda_content:
        yield j


def run_topic_model(output_dir, n_topics, content_fields, field_filters=None, field_filter_vals=None, seed=42):

    np.random.seed(seed)
    # documents = iter_elastic_query(ES_INSTANCE + ES_INDEX, "abstract", "", query=None)
    documents = read_bulk_index(elastic + "original/", content_fields, field_filters, field_filter_vals)

    corpus = EntitiesTokenizer(documents) #receives a generator of strings (content for each doc)

    # if os.path.isdir(output_dir):
    #     shutil.rmtree(output_dir)

    # os.makedirs(output_dir)

    corpus_bow = CorpusBOW(corpus)

    corpus_dict = corpus_bow.save_dict(os.path.join(output_dir, 'corpus.dict'))
    # Serialize and store the corpus
    corpus_file = corpus_bow.serialize(os.path.join(output_dir, 'corpus.mm'))
    # Create LDA model from corpus and dictionary

    topik_lda = LDA(os.path.join(output_dir, 'corpus.mm'), os.path.join(output_dir,'corpus.dict'), n_topics,
              update_every=1, passes=5)

    topik_lda.save(os.path.join(output_dir, 'model.gensim'))

    # Generate the input for the termite plot
    topik_lda.termite_data(os.path.join(output_dir,'termite.csv'))
    # Get termite plot for this model
    termite = Termite(os.path.join(output_dir,'termite.csv'), "Termite Plot")
    termite.plot(os.path.join(output_dir,'termite.html'))

    df_results = generate_csv_output_file(documents, corpus, corpus_bow, topik_lda.model)

    to_r_ldavis(corpus_bow, dir_name=os.path.join(output_dir, 'ldavis'), lda=topik_lda)
    os.environ["LDAVIS_DIR"] = os.path.join(output_dir, 'ldavis')
    try:
        subprocess.call(['Rscript', os.path.join(BASEDIR,'topic-space/R/runLDAvis.R')])
    except ValueError:
        logging.warning("Unable to run runLDAvis.R")



def entities_list(content_fields, field_filters=None, field_filter_vals=None, seed=42):
    np.random.seed(seed)
    # documents = iter_elastic_query(ES_INSTANCE + ES_INDEX, "abstract", "", query=None)
    documents = read_bulk_index(elastic + "original/", content_fields, field_filters, field_filter_vals)

    corpus = EntitiesTokenizer(documents) #receives a generator of strings (content for each doc)
    word_list = []
    for x in corpus:
        if not x in exclude_hist_values:
            word_list.append(x)
    return word_list



def doc_topics(content_fields):
    """Returns dictionary of topic probabilities for each doc in the corpus. 
    Key is document number (in order), val is list of probabilities."""
    lookup = {}
    documents = read_bulk_index(elastic + "original/", content_fields)
    corpus = EntitiesTokenizer(documents)
    corpus_bow = CorpusBOW(corpus)
    cnt = 0
    if os.path.isfile(BASEDIR + "/lda_output/model.gensim"):
        lda = gensim.models.LdaModel.load(BASEDIR + "/lda_output/model.gensim")
        for doc in corpus_bow:
            lookup[cnt] = lda[doc]
            cnt += 1
    else:
        raise ValueError("No model found")
    return lookup



def lda_terms(doc, field_names):
    """Returns all instances of noun phrases deemed salient by topic model for a doc"""
    terms_dict = {}
    nps = ""
    # dict = json.loads(doc, encoding="utf8")
    with open(lda_output + "/ldavis/output/lda.json") as lda_raw:
        lda_nps = json.load(lda_raw, encoding="utf8")['tinfo']['Term']
        combined = ""
        for field in field_names:
            combined += " " + json.dumps(doc[field])
        generator = iter([combined])
        for list in EntitiesTokenizer(generator):
            for np in list:
                if np in lda_nps and not np in nps and not np in exclude_hist_values:
                    nps += np + " "
    return nps


def doc_classifier():
    train = []
    documents = read_bulk_index(elastic + "original/")
    cnt = 0
    for doc in documents:
        # doc = json.loads(doc)
        if cnt % 2 == 1 and doc['category'] != "":
            term_string = ""
            for x in lda_terms(doc, lda_content_fields):
                term_string += " " + x
            train.append((term_string, doc["category"]))
        cnt += 1
    return NaiveBayesClassifier(train)

def lda_location_terms(lda_terms):
    """For all noun phrases that were salient for LDA, check if they are locations"""
    with open(lda_output + "ldavis/output/lda.json") as lda_raw:
        lda_nps = json.load(lda_raw)['tinfo']['Term']
        # for np in doc:
        #LOCATION PARSING



# def docs_like_this(doc_id, endpoint, _index, fields, num_results, doc_type):
#     """Use elastic's 'more like this' API after initial set of fields is indexed. Update index with similar doc field(s)"""
#     es = Elastic(endpoint + _index)
#     #Parse doc id out of doc json object
#     mlts = es.more_like_this(index=_index, doc_type=doc_type, id=doc_id, mlt_fields=fields, search_size=num_results)
#     results = mlts["hits"]["hits"]
#     return results

def docs_like_this(fields, num_results):
    """fields is a list"""
    val_lookup = {}
    cnt = 1
    doc_cnt = 0
    for dict in read_bulk_index(elastic + "original/"):
        if cnt % 2 == 0:
            val_lookup[doc_cnt] = []
            for field in fields:
                val_lookup[doc_cnt].append(dict[field])
            doc_cnt += 1
        cnt += 1

    like_this = {}
    corpus = gensim.corpora.MmCorpus(os.path.join(lda_output, 'corpus.mm'))
    index = gensim.similarities.docsim.Similarity(lda_output, corpus, num_features=corpus.num_terms) # build the index
    index.num_best = num_results
    cnt = 0
    for similarities in index:
        like_this[cnt] = []
        for x in range(1, len(similarities)):
            match = []
            match.append(similarities[x][1])
            match.append(val_lookup[similarities[x][0]])
            like_this[cnt].append(match)
        cnt += 1
    assert doc_cnt == cnt, "number of docs in corpus does not equal number of docs read from file"
    return like_this
    



def force_directed_nodes(author_field, filter_field, filter_field_val):
    """
    run after topic assignment has been inputted 
    json = {"nodes": [{"name":"Kyle", "group": 4}], "links": [{"source": 1, "target":0, "value": 3}]}
    link source always goes to a lower number target

    ideas...
    outlines -> most connected
    size -> most written
    allow faceting by double-clicking
    Allow toggle for link to facets -> may want to see all connections (indicated faceted ones by shape change??)
    Link to facets --> Use a data filter when loading d3 data to look at facets for authors and topics, make sure they are present in facet
    """
    author_topics = {}
    author_nums = {} #allows to lookup author based on number when building list of nodes
    author_num_lookup = {} #need to keep an order for linkages in json output
    nodes = []
    auth_cnt = 0

    cnt = 1
    for dict in read_bulk_index(elastic + "new/"):
        if cnt % 2 == 0:
            # auths_list = dict[author_field].split("--")
            auths_list = [x.lower() for x in dict[author_field]]
            if filter_field != None:
                type = dict[filter_field] #USE THIS TO FILTER
                if type == filter_field_val:  
                    topic = dict["topic1_topic"]
                    for auth in auths_list:
                        if auth in author_topics:
                            author_topics[auth].append(topic)       
                        else:
                            if auth != "":    
                                author_topics[auth] = [topic]
                                author_nums[auth_cnt] = auth
                                author_num_lookup[auth] = auth_cnt
                                auth_cnt += 1
            else:
                topic = dict["topic1_topic"]
                for auth in auths_list:
                    if auth in author_topics:
                        author_topics[auth].append(topic)       
                    else:
                        if auth != "":    
                            author_topics[auth] = [topic]
                            author_nums[auth_cnt] = auth
                            author_num_lookup[auth] = auth_cnt
                            auth_cnt += 1


        cnt += 1

    for x in range(0, len(author_nums)):
        node = {}
        node["name"] = author_nums[x]
        # node["group"] = Counter(author_topics[key]).most_common(1)[0] 
        # max(set(list), key=list.count) 
        node["group"] = max(set(author_topics[author_nums[x]]), key=author_topics[author_nums[x]].count) #mode
        node["amount"] = len(author_topics[author_nums[x]])
        nodes.append(node)
    print len(nodes)
    print auth_cnt
    return [nodes,author_num_lookup]





def force_directed_links(author_field, author_nums, filter_field, filter_field_val):
    """author_nums: dictionary of numbers assigned to each author"""
    links = []
    links_lookup = {}

    cnt = 1
    for dict in read_bulk_index(elastic + "new/"):
        if cnt % 2 == 0:
            if filter_field != None:
                type = dict[filter_field] #USE THIS TO FILTER
                if type == filter_field_val: 
                    auths_list = [x.lower() for x in dict[author_field]]
                    for auth in auths_list:
                        for inner_auth in auths_list: 
                            if author_nums[auth] > author_nums[inner_auth]:
                                if auth + "_" + inner_auth in links_lookup:
                                    links_lookup[auth + "_" + inner_auth] += 1
                                else:
                                    links_lookup[auth + "_" + inner_auth] = 1
            else:
                auths_list = [x.lower() for x in dict[author_field]]
                for auth in auths_list:
                    for inner_auth in auths_list:
                        try: 
                            if author_nums[auth] > author_nums[inner_auth]:
                                if auth + "_" + inner_auth in links_lookup:
                                    links_lookup[auth + "_" + inner_auth] += 1
                                else:
                                    links_lookup[auth + "_" + inner_auth] = 1
                        except:
                            print "author key lookup error"
        cnt += 1

    lookup_errors = 0
    for key, value in links_lookup.iteritems():
        link = {}
        if key.split("_")[0] != "" and key.split("_")[1] != "":
            try:
                link["source"] = author_nums[key.split("_")[0]]
                link["target"] = author_nums[key.split("_")[1]]
                link["value"] = value
                link["source_name"] = key.split("_")[0]
                link["target_name"] = key.split("_")[1]
                links.append(link)
            except:
                lookup_errors += 1
    print "lookup errors: " + str(lookup_errors)
    print "num of links: " + str(len(links))
    links_sorted = sorted(links, key=lambda k: k['source']) 
    return links_sorted




def force_directed_data(output_dir, author_field, filter_field=None, filter_field_val=None):
    final_json = {}
    nodes_data = force_directed_nodes(author_field, filter_field, filter_field_val)
    author_nums = nodes_data[1]
    final_json["nodes"] = nodes_data[0]
    # final_json["links"] = force_directed_links("authors", author_nums)
    final_json["links"] = force_directed_links(author_field, author_nums, filter_field, filter_field_val)
    with open(BASEDIR + "/people.json", "w") as out:
        json.dump(final_json, out, sort_keys=True, indent=4, ensure_ascii=True)



def split_file(_dir, file):
    """Split file into 3000 line chunks. 10mb is bulk upload limit on amazon es instances."""
    output = subprocess.check_output("cd " + _dir + "; split -l 2500 " + _dir + file + " block", shell=True)
    #ADD CHECK FOR SIZE, IF TOO BIG, MAKE LINE NUM SMALLER



def upload_index_and_mapping(endpoint, index, index_dir, mapping_file, delete_old=False):
    if delete_old:
        os.system("curl -XDELETE '%s%s'" %(endpoint, index))
        mapping = subprocess.check_output("curl -XPOST %s%s --data-binary @%s" %(endpoint, index, mapping_file), shell=True)
        print "Mapping: " + mapping
    for block in os.listdir(index_dir):
        # if not "full_index" in block and block != ".DS_Store":
        if not "index" in block and block != ".DS_Store" and not "abstract" in block and not "map" in block:
            post = subprocess.check_output("curl -s -XPOST %s/_bulk --data-binary @%s" %(endpoint, index_dir + block), shell=True)
            print "curl -s -XPOST %s/_bulk --data-binary @%s" %(endpoint, index_dir + block)
            print post


# cl = doc_classifier()

# run_topic_model(lda_output, num_topics, lda_content_fields)

# common_terms = entities_list(lda_content_fields)

# topic_prob_lookup = doc_topics(lda_content_fields)    
# similar_lookup = docs_like_this([title_field, authors_field], 6)

# if not os.path.exists(elastic + "new/"):
#     os.makedirs(elastic + "new/")
# with open(elastic + "new/full_index", "w") as new:
#     line_num = 1
#     doc_cnt = 0 #every other

#     for doc in read_bulk_index(elastic + "original/"):
#         if line_num % 2 == 1:
#             doc["index"]["_index"] = index
#             new.write(json.dumps(doc) + "\n")
#         if line_num % 2 == 0:
#             # doc["category"] = classifier("/users/hundman/documents/data_science/facetview-general/cats/", iter([(doc["abstract"] + doc["content"]).encode("ascii","ignore")]))
#             # keywords
#             doc["keywords"] = lda_terms(doc, lda_content_fields)
#             doc["entities"] = common_terms[doc_cnt]
#             if(doc["category_train"] == ""):
#                 lda_terms_string = ""
#                 for x in lda_terms(doc, lda_content_fields):
#                     lda_terms_string += " " + x
#                 doc["category_train"] = cl.classify(lda_terms_string)
#             # topics
#             topic_probs = topic_prob_lookup[doc_cnt]
#             _sorted = sorted(topic_probs, key=lambda tup: tup[1], reverse=True)[:5]
#             for k in range(0, len(_sorted)):
#                 doc["topic" + str(k+1) + "_topic"] = _sorted[k][0] + 1
#                 doc["topic" + str(k+1) + "_prob"] = _sorted[k][1]
#             #similar docs
#             similar_docs = similar_lookup[doc_cnt]
#             doc["similar"] = []
#             for x in range(0, len(similar_docs)):
#                 new_sim = {}
#                 new_sim["title"] = similar_docs[x][1][0]
#                 new_sim["score"] = similar_docs[x][0]
#                 new_sim["authors"] = similar_docs[x][1][1][:-1]
#                 doc["similar"].append(new_sim)
#             new.write(json.dumps(doc) + "\n")
#             doc_cnt += 1 
#         line_num += 1

# Must run this after topic assignment
# force_directed_data(BASEDIR, authors_field)

# split_file(elastic + "new/", "full_index")
# upload_index_and_mapping(elastic_endpoint, index, elastic + "new/", elastic + mapping_file, delete_old=True)
# sp = subprocess.Popen(['python', '-m', 'SimpleHTTPServer', '8010'])
