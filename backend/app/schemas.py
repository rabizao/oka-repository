from marshmallow_sqlalchemy import SQLAlchemySchema, SQLAlchemyAutoSchema, auto_field
from marshmallow_sqlalchemy.fields import Nested
from app import db
from app.models import Job, Tag
from marshmallow import fields, post_load, EXCLUDE, ValidationError


class TagSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        sqla_session = db.session
        load_instance = True
        include_relationships = True

    id = auto_field(dump_only=True)


class JobQueryArgsSchema(SQLAlchemySchema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String()
    description = fields.String()

    @post_load
    def parse_search_list(self, data, **kwargs):
        for key, value in data.items():
            data[key] = data[key].split(',')
        return data


class JobSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Job
        sqla_session = db.session
        load_instance = True
        include_relationships = True

    @post_load
    def check_uuid(self, data, **kwargs):
        if Job.get_by_uuid(data['uuid']):
            raise ValidationError(field_name='uuid',
                                  message="Already in use.")
        return data

    id = auto_field(dump_only=True)
    tags = Nested(TagSchema, many=True, exclude=("job",))
