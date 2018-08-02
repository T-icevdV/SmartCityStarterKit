import urllib2
import json
import requests
response = urllib2.urlopen('http://data.aireas.com/api/v2/airboxes/3')
html = response.read()
json = json.loads(html)
temp = json["last_measurement"]["calibrated"]["readings"]["Temp"]

url = "http://localhost:1026/v2/entities/Airbox_1/attrs"
header = {"Content-Type": "application/json", "Fiware-Service": "Airbox1", "Fiware-Servicepath": "/"}
payload = '{"temperature": {"value": %d,"type": "Float"}}' % temp

print(requests.patch(url, data = payload, headers = header))
