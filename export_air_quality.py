# coding=utf-8
import json
import math
import requests
import datetime
import sys
import geohash

#air_quality_url = "https://data.eindhoven.nl/api/records/1.0/search/?dataset=realtime-luchtkwaliteit-in-eindhoven&rows=50"
air_quality_url = "http://data.aireas.com/api/v2/airboxes"
orion_url = "http://localhost:1026/v2/op/update?options=keyValues"

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
    #print(json_resp)
    for item in json_resp:
        url = "http://data.aireas.com/api/v2/airboxes/" + str(item["_id"]).replace(".0", "")
        #print url
        get_single_air_quality_station_info(url)

    orion_batch_update_entity = {
        "actionType": sys.argv[1],
        "entities": air_stations
    }
    # print(json.dumps(orion_batch_update_entity, indent=4, sort_keys=True))
    update_entity_list(orion_batch_update_entity)
    print_errors()


get_data_from_ckan()

