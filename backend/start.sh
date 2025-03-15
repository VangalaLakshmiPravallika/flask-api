#!/bin/bash
export FLASK_APP=app.py  # Make sure Flask loads the correct file
flask run --host=0.0.0.0 --port=10000  # Run Flask manually