import requests

url = "http://localhost:1026/v2/subscriptions/"
header = {"Content-Type": "application/json" }
payload = '{"description":  "Subscription to all Aireas sensors", "subject": { "entities": [ { "idPattern": ".*" } ] } , "notification": { "http": { "url": "http://cygnus:5050/notify" }, " attrsFormat": "legacy"}, "expires": "2040-01-01T14:00:00.00Z" }'

r = requests.post(url, data = payload, headers = header)
print(r.text)

