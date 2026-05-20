from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()

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
            'created_at',
            'updated_at',
        ]
        # reporter di-set otomatis dari token, tidak boleh dikirim dari frontend
        read_only_fields = ['reporter', 'created_at', 'updated_at']

    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.username
        return "Warga Anonim"
