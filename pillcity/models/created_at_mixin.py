class CreatedAtMixin(object):
    @property
    def created_at(self):
        return self.id.generation_time.timestamp()
