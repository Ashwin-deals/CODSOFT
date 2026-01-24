from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
	path('admin/', admin.site.urls),
	# include the contacts app URLs (they define /api/... paths)
	path('', include('contacts.urls')),
	# serve the frontend index.html at the site root
	path('', TemplateView.as_view(template_name='index.html'), name='index'),
]

