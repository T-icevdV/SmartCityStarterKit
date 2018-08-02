## Introduction

The BAE Search Filters widget is a WireCloud widget that provides the ability to choose filters to limit the type of offerings provided by a BAE instance.

This is used by the [bae-browser-widget](https://github.com/Wirecloud/bae-browser-widget) to filter the offerings displayed.

## Settings

-`Server URL`: The URL of the BAE server.

## Wiring

### Output Endpoints

-`Filters`: The selected filters data.

## Usage

Choose the desired filters and they will be sent through the wiring.

Available filters:
- Catalogue: The catalogue of the offering.
- Category: The category of the offering.
- Type: The type of the components held by the offering.
- Bundle: If the offering is a bundle or not.
- Status: If its purchased / installed or not.

This widget is created dynamically by the [bae-browser-widget](https://github.com/Wirecloud/bae-browser-widget) so it doensn't need to be added manually to the dashboard when using it.