"""mychess URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from mychess.views import move_evaluation, evaluateMove,getLegalMoves,reset,moveisenpassant,freemoves,home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('move_evaluation/',move_evaluation),
    path('move_evaluation/evaluate/',evaluateMove),
    path('move_evaluation/legal_moves/',getLegalMoves),
    path('move_evaluation/reset/',reset),
    path('move_evaluation/moveisenpassant/',moveisenpassant),
    path('freemoves/',freemoves),
    path('',home)
]
