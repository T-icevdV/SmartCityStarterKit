# coding=utf-8
import json
import math
import requests
import datetime
import sys
import geohash

'''
https://fiware-datamodels.readthedocs.io/en/latest/Environment/AirQualityObserved/doc/spec/index.html
{
  "id": "Madrid-AmbientObserved-28079004-2016-03-15T11:00:00",
  "type": "AirQualityObserved",
  "address": {
    "addressCountry": "ES",
    "addressLocality": "Madrid",
    "streetAddress": "Plaza de España"
  },
  "dateObserved": "2016-03-15T11:00:00/2016-03-15T12:00:00",
  "location": {
    "type": "Point",
    "coordinates": [-3.712247222222222, 40.423852777777775]
  },
  "source": "http://datos.madrid.es",
  "precipitation": 0,
  "relativeHumidity": 0.54,
  "temperature": 12.2,
  "windDirection": 186,
  "windSpeed": 0.64,
  "airQualityLevel": "moderate",
  "reliability": 0.9,
  "CO": 500,
  "NO": 45,
  "NO2": 69,
  "NOx": 139,
  "SO2": 11,
  "CO_Level": "good",
  "NO_Level": "moderate",
  "refPointOfInterest": "28079004-Pza. de España"
}
'''

air_quality_url = "https://data.eindhoven.nl/api/records/1.0/search/?dataset=realtime-luchtkwaliteit-in-eindhoven&rows=50"
orion_url = "http://localhost:1026/v2/op/update?options=keyValues"
# orion_url = "http://212.159.228.70:1026/v2/op/update?options=keyValues"

air_stations = []
error_list = []


def create_air_station_list(data, station_url):
    try:
        t_in_milliseconds = data["last_measurement"]["calibrated"]["when"]["$date"]
        t_date_time = datetime.datetime.fromtimestamp(t_in_milliseconds / 1000.0)
        coord = (convert_gps_2_latlng(data["last_measurement"]["calibrated"]["readings"]["GPS"]["lon"]),
                 convert_gps_2_latlng(data["last_measurement"]["calibrated"]["readings"]["GPS"]["lat"]))

        station = {
            "id": "ein-aireas-" + str(int(data["_id"])),
            "type": "AirQualityObserved",
            "dateObserved": str(t_date_time),
            "location": {
                "type": "Point",
                "coordinates": coord
            },
            "geohash": geohash.encode(coord[1],coord[0]),
            "source": station_url,
            "relativeHumidity": data["last_measurement"]["calibrated"]["readings"]["RelHum"],
            "temperature": data["last_measurement"]["calibrated"]["readings"]["Temp"],
            "airQualityLevel": "moderate",
            "PM1": data["last_measurement"]["calibrated"]["readings"]["PM1"],
            "PM25": data["last_measurement"]["calibrated"]["readings"]["PM25"],
            "Ozon": data["last_measurement"]["calibrated"]["readings"]["Ozon"],
            "PM10": data["last_measurement"]["calibrated"]["readings"]["PM10"],
            "NO2": data["last_measurement"]["calibrated"]["readings"]["NO2"]
        }
        air_stations.append(station)

        # print(json.dumps(station, indent=4, sort_keys=True))
    except KeyError as e:
        error_desc = {
            "id": station_url,
            "desc": "Wrong format or missing fields!"
        }
        error_list.append(error_desc)
        print("Data source problem, skipping: " + station_url)


def convert_gps_2_latlng(gps_value):
    degrees = math.floor(gps_value / 100)
    minutes = gps_value - (degrees * 100)
    result = degrees + (minutes / 60)
    return result


def get_single_air_quality_station_info(station_url):
    station_data_json_resp = requests.get(station_url).json()
    create_air_station_list(station_data_json_resp, station_url)


def update_entity_list(entity_list):
    try:
        r = requests.post(orion_url, json=entity_list)
        print("Batch operation response code: " + str(r.status_code))
    except requests.exceptions.RequestException as e:  # This is the correct syntax
        print(e)


def print_errors():
    print("===============================================================================")
    print("Number of stations successfully sent to Orion: " + str(len(air_stations)))
    print("List of problematic stations: " + str(len(error_list)))
    if len(error_list) > 0:
        for item in error_list:
            print("\t  " + item["id"] + "\n")
    print("===============================================================================")


def get_data_from_ckan():
    json_resp = requests.get(air_quality_url).json()
    for item in json_resp["records"]:
        get_single_air_quality_station_info(item["fields"]["airbox_numbers_version_0_4"])

    orion_batch_update_entity = {
        "actionType": sys.argv[1],
        "entities": air_stations
    }
    # print(json.dumps(orion_batch_update_entity, indent=4, sort_keys=True))
    update_entity_list(orion_batch_update_entity)
    print_errors()


get_data_from_ckan()

