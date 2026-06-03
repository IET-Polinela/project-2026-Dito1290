from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'reporter',
            'reporter_name',
            'is_owner',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['reporter', 'created_at', 'updated_at']

    def get_reporter_name(self, obj):
        request = self.context.get('request')
        # Jika tab=feed, sembunyikan nama pelapor di level serializer
        tab = None
        if request:
            tab = request.query_params.get('tab', None)
        if tab == 'feed':
            return "Warga Anonim"
        if obj.reporter:
            return obj.reporter.username
        return "Warga Anonim"

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.reporter == request.user
        return False
