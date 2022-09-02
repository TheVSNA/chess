from django.shortcuts import render
import json

from django.http import HttpResponse
def home(request):
    return render(request,"index.html")

def test(request):
    print("It's working!")
    response_data={
        'foo':'bar'
    }
    #return render(request,"index.html")
    return HttpResponse(json.dumps(response_data), content_type="application/json")