## Introduction

The BAE Browser Widget is a WireCloud widget that provides the ability to browse, filter and install the Wirecloud offerings available at a Bussiness API Ecosystem instance in a simple widget, easily configured by just providing the BAE instance's URL.

This widget requires the [bae-details-widget](https://github.com/Wirecloud/bae-details-widget) and the [bae-search-filters-widget](https://github.com/Wirecloud/bae-search-filters-widget) to be added to the Wirecloud instance resources in order to work.

## Settings

-`Server URL`: The BAE instance to be used.

## Wiring

This widget has no wiring.

## Usage

To use this Wirecloud component you just need to add it to a dashboard and set its `Server URL` preference.

Afterwards, you can specify the filters to be applied to harvested offerings and filter them by name, or display an offering details, by clicking on it, such as the products it offers and its price.

If an offering is owned by the current user, an install / uninstall button will be displayed, else, a purchase button will be displayed in order to get the offering from the BAE instance.
This component uses the [bae-details-widget](https://github.com/Wirecloud/bae-details-widget) and the [bae-search-filters-widget](https://github.com/Wirecloud/bae-search-filters-widget) to work, so those components must be added to the Wirecloud instance too, though they dont have to be added to the dashboard nor configured in any way as they are created dynamically by the `bae-browser-widget`.