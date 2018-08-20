import requests

for i in range(1,37):
	url = "http://localhost:1026/v2/subscriptions/"
	header = {"Content-Type": "application/json" }
	payload = '{"description": "Test subscription","subject": {"entities": [{"id": "ein-aireas-'+str(i)+'","type": "AirQualityObserved"}]},"notification": {"http": {"url": "http://quantum-leap:8668/v2/notify"},"attrs": [],"metadata": ["dateCreated", "dateModified"]},"throttling": 5}'
	r = requests.post(url, data = payload, headers = header)
	print(i)
