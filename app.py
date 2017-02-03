from boto.s3.connection import S3Connection
from boto.s3.key import Key
from flask import (
	Flask,
	request,
	render_template,
	send_from_directory,
	url_for,
	jsonify,
	Response
)
from functools import wraps
import os
import json
from werkzeug import secure_filename

################################################################

from math import pi

import numpy as np

import os
import time
from elasticsearch import Elasticsearch

import pandas as pd
# from pandasql import sqldf

# from colour import Color
import re

################################################################

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)

from logging import Formatter, FileHandler
handler = FileHandler(os.path.join(basedir, 'log.txt'), encoding='utf8')
handler.setFormatter(
	Formatter("[%(asctime)s] %(levelname)-8s %(message)s", "%Y-%m-%d %H:%M:%S")
)
app.logger.addHandler(handler)

@app.route('/css/<path:filename>')
def css_static(filename):
	return send_from_directory(app.root_path + '/css/', filename)

@app.route('/static/<path:filename>')
def js_static(filename):
	return send_from_directory(app.root_path + '/static/', filename)

@app.route('/band_method')
def band_viz():
	script, div = components(bands)
	# html = file_html(bands, CDN, "test") 
	return render_template("co_occurence.html", script=script, div=div)

@app.route('/search')
def search():
	return render_template("search.html")

@app.route('/orbit_method')
def orbit_viz():
    script, div = components(orbits)
    # html = file_html(bands, CDN, "test") 
    return render_template("co_occurence.html", script=script, div=div)

@app.route('/')
def index():
    return render_template('search.html')
    # return render_template('index.html')
    # return render_template('start.html') 

@app.route("/load-project", methods=["GET"])
def getProjectNames():
	projects = []
	[projects.append(x.name.replace("/","")) for x in bucket.list("", "/")]
	return json.dumps(projects)
			

if __name__ == "__main__":
	app.run(debug=True, host='0.0.0.0', port=5000)