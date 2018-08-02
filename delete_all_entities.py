# TODO: Fix hardcoded url
# OK DONE
import json
import logging

import requests
'''
logging.basicConfig(filename="/tmp/orion_bus_real_time_batch_operations.log", level=logging.DEBUG,
                    format='%(asctime)s.%(msecs)03d %(levelname)s %(module)s - %(funcName)s: %(message)s',
                    datefmt="%Y-%m-%d %H:%M:%S")

'''

orion_url = "http://localhost:1026/v2/entities/"


# http://fiware-datamodels.readthedocs.io/en/latest/Transportation/Vehicle/Vehicle/doc/spec/index.html

def delete_air_quality_entity_list():
    json_resp = requests.get(orion_url).json()
    for item in json_resp:
        try:
            url = orion_url + item["id"]
            r = requests.delete(url)
            if 204 == r.status_code:
                print("Deleted: " + str(item["id"]))
            else:
                print("Problem: ", str(item["id"]))

        except requests.exceptions.RequestException as e:  # This is the correct syntax
            logging.error(e)
    return


delete_air_quality_entity_list()

