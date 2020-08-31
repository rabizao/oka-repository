from cururu.pickleserver import PickleServer
from local.CururuServer import CururuServer
from pjdata.content.specialdata import UUIDData

storage = CururuServer(
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9"
    ".eyJpYXQiOjE1OTg5MTEyNDMsIm5iZiI6MTU5ODkxMTI0MywianRpIjoiMWU4YTg3NWItNzQ4YS00NGI1LWE1MGEtNTA3MDFkOTFjMWMxIiwiZXhwIjoxNTk4OTU0NDQzLCJpZGVudGl0eSI6ImRhdmlwcyIsImZyZXNoIjpmYWxzZSwidHlwZSI6ImFjY2VzcyJ9.Z54-YsE7Sq--NqK34QScGl8J0RVfbg-Igj_pfHp7vK0")
# storage = PickleServer(db="../backend/app/static")  # TODO: history desapareceu!
d = storage.fetch(UUIDData("QӔťȕǖΨΤǘհЫȬǞшA"))
print(d.history)
print(d)
