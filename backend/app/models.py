from app import db
from datetime import datetime
from sqlalchemy import or_


class PaginateMixin(object):
    @classmethod
    def get(cls, data, page, page_size):
        search_conds = [getattr(cls, e).like(f"%{ee}%") for e, values in data.items() for ee in values]
        resources = cls.query.filter_by(active=True).filter(or_(*search_conds)).paginate(page, page_size, False)
        return resources.items, resources.total


class Job(PaginateMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(256), unique=True, nullable=False)
    name = db.Column(db.String(120))
    description = db.Column(db.String(2000))
    active = db.Column(db.Boolean, default=True)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    tags = db.relationship('Tag', backref='job', lazy='dynamic')

    def new_tag(self, name):
        tag = Tag(name=name, job=self)
        self.tags.append(tag)
        return tag

    @staticmethod
    def get_by_uuid(uuid):
        return Job.query.filter_by(uuid=uuid).first()


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'))
    name = db.Column(db.String(120))
    description = db.Column(db.String(1000))
