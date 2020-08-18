from django.http import HttpResponse
import json

def apiRespond(code,**data):
    res= HttpResponse(json.dumps(data),content_type="text/json")
    res.status_code=code
    return res