/*
 * workspace-browser
 * https://github.com/aarranz/workspace-browser-widget
 *
 * Copyright (c) 2016-2017 CoNWeT Lab, Universidad Politécnica de Madrid
 * Copyright (c) 2017 Future Internet Consulting and Development Solutions S.L.
 * Licensed under the Apache-2.0 license.
 */

/* globals StyledElements */
/* exported WorkspaceBrowser */

(function (mp, se) {

    "use strict";

    var builder = new se.GUIBuilder();
    var empty_search_template = builder.DEFAULT_OPENING + '<div class="alert alert-warning"><p>We couldn\'t find anything for your search - <b><t:keywords/>.</b></p><p>Suggestions:</p><ul><li>Make sure all words are spelled correctly.</li><li>Try different keywords.</li><li>Try more general keywords.</li></ul></div>' + builder.DEFAULT_CLOSING;
    var error_template = builder.DEFAULT_OPENING + '<div class="alert alert-error"><t:message/></div>' + builder.DEFAULT_CLOSING;
    var corrected_query_template = builder.DEFAULT_OPENING + '<div class="alert alert-info"><p>Showing results for <b><t:corrected_query/></b></p></div>' + builder.DEFAULT_CLOSING;
    var workspace_template = builder.DEFAULT_OPENING +
        '<div class="workspace"><t:visibility/><div class="workspace-details"><div><strong><t:owner/>/<t:title/></strong></div><div><t:description/></div></div><div class="workspace-actions btn-group"><t:usebutton iconClass="fa fa-play"/><t:removebutton state="danger" iconClass="fa fa-trash"/></div></div>' +
        builder.DEFAULT_CLOSING;

    var request = null;
    var timeout = null;
    var anonymous = MashupPlatform.context.get('isanonymous');
    var current_user = mp.context.get('username');
    var current_workspace = mp.mashup.context.get('owner') + '/' + mp.mashup.context.get('name');

    var source = new se.PaginatedSource({
        pageSize: 30,
        requestFunc: function (page, options, resolve, reject) {
            var url = "/api/search";
            var query = text_input.value;

            if (request != null) {
                request.abort();
            }

            if (!anonymous) {
                if (privateButton.active) {
                    query += " shared:false";
                } else if (sharedButton.active) {
                    query += " shared:true public:false";
                } else if (publicButton.active) {
                    query += " public:true";
                }

                if (ownedButton.active) {
                    query += " owner:" + mp.context.get('username');
                } else if (othersButton.active) {
                    query += " NOT owner:" + mp.context.get('username');
                }
            }

            request = mp.http.makeRequest(url, {
                method: 'GET',
                supportsAccessControl: true,
                parameters: {
                    namespace: "workspace",
                    q: query,
                    pagenum: page,
                    maxresults: options.pageSize
                },
                onComplete: function (response) {
                    var data, raw_data;

                    if (response.status === 200) {
                        try {
                            raw_data = JSON.parse(response.responseText);
                            data = {
                                resources: raw_data.results,
                                current_page: parseInt(raw_data.pagenum, 10),
                                total_count: parseInt(raw_data.total, 10)
                            };
                            if ('corrected_q' in raw_data) {
                                data.corrected_query = raw_data.corrected_q;
                            }
                        } catch (e) {
                            reject("Invalid response from server");
                        }
                        resolve(data.resources, data);
                    } else if (response.status === 0) {
                        reject("Error connecting with the server");
                    } else {
                        reject("Invalid response from server");
                    }
                }
            });
        },
        processFunc: function (workspaces, search_info) {
            var message;

            layout.center.clear();

            if (search_info.total_count === 0) {
                message = builder.parse(empty_search_template, {keywords: text_input.value});
                layout.center.appendChild(message);
                return;
            }

            if ('corrected_query' in search_info) {
                message = builder.parse(corrected_query_template, {corrected_query: search_info.corrected_query});
                layout.center.appendChild(message);
            }

            workspaces.forEach(function (workspace, search_info) {
                var workspace_entry = builder.parse(workspace_template, {
                    name: workspace.name,
                    title: workspace.title,
                    owner: workspace.owner,
                    description: workspace.description,
                    visibility: function (options) {
                        var element = document.createElement('i');
                        element.className = "fa fa-fw fa-2x";
                        if (workspace.public) {
                            element.classList.add('fa-globe');
                        } else if (workspace.shared) {
                            element.classList.add('fa-share-alt');
                        } else {
                            element.classList.add('fa-lock');
                        }
                        return element;
                    },
                    usebutton: function (options) {
                        var button = new se.Button(options);
                        button.addEventListener("click", function () {
                            mp.mashup.openWorkspace(workspace);
                        });
                        button.enabled = (workspace.owner + '/' + workspace.name) !== current_workspace;
                        return button;
                    },
                    removebutton: function (options) {
                        if (!anonymous) {
                            var button = new se.Button(options);
                            button.addEventListener("click", function () {
                                mp.mashup.removeWorkspace(workspace, {
                                    onSuccess: function () {
                                        source.refresh();
                                    }
                                });
                            });
                            button.enabled = workspace.owner === current_user;
                            return button;
                        }
                    }
                });
                layout.center.appendChild(workspace_entry);
            });
        }
    });
    source.addEventListener('requestStart', function () {
        layout.center.disable();
    });

    source.addEventListener('requestEnd', function (source, error) {
        layout.center.enable();

        if (error) {
            layout.center.clear();

            var message = builder.parse(error_template, {message: error});
            layout.center.appendChild(message);
        }
    });

    var keywordTimeoutHandler = function keywordTimeoutHandler() {
        timeout = null;
        source.refresh();
    };

    var onSearchInputChange = function onSearchInputChange(modifiers) {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }

        timeout = setTimeout(keywordTimeoutHandler, 700);
    };

    var onSearchInputKeyPress = function onSearchInputKeyPress(input, modifiers, key) {
        if (modifiers.controlKey === false && modifiers.altKey === false && key === "Enter") { // enter

            // Cancel current timeout
            if (timeout !== null) {
                clearTimeout(timeout);
                timeout = null;
            }

            // Inmediate search
            source.refresh();
        }
    };

    var layout = new se.VerticalLayout();
    layout.appendTo(document.body);

    var heading_layout = new se.HorizontalLayout();
    layout.north.appendChild(heading_layout);

    // Input field
    var input_div = new se.Container({class: "se-input-group se-input-group-block"});
    var text_input = new StyledElements.StyledTextField({placeholder: 'Search keywords'});
    input_div.appendChild(text_input);
    text_input.addEventListener('keydown', onSearchInputKeyPress);
    text_input.addEventListener('change', onSearchInputChange);
    heading_layout.center.appendChild(input_div);

    if (!anonymous) {
        // Owner filter buttons
        var filter_buttons = new se.Container({class: 'btn-group'});
        heading_layout.east.appendChild(filter_buttons);

        var allButton = new se.ToggleButton({iconClass: 'fa fa-circle', title: 'All Dashboards'});
        allButton.addEventListener('click', function () {
            allButton.active = true;
            ownedButton.active = false;
            othersButton.active = false;
            source.refresh();
        });
        allButton.active = true;
        filter_buttons.appendChild(allButton);
        var ownedButton = new se.ToggleButton({iconClass: 'fa fa-user', title: 'My Dashboards'});
        ownedButton.addEventListener('click', function () {
            allButton.active = false;
            ownedButton.active = true;
            othersButton.active = false;
            source.refresh();
        });
        filter_buttons.appendChild(ownedButton);
        var othersButton = new se.ToggleButton({iconClass: 'fa fa-users', title: 'Others Dashboards'});
        othersButton.addEventListener('click', function () {
            allButton.active = false;
            ownedButton.active = false;
            othersButton.active = true;
            source.refresh();
        });
        filter_buttons.appendChild(othersButton);

        // Visibility filter buttons
        var visibility_buttons = new se.Container({class: 'btn-group'});
        heading_layout.east.appendChild(visibility_buttons);

        var anyButton = new se.ToggleButton({iconClass: 'fa fa-circle', title: 'All Dashboards'});
        anyButton.addEventListener('click', function () {
            anyButton.active = true;
            privateButton.active = false;
            sharedButton.active = false;
            publicButton.active = false;
            source.refresh();
        });
        anyButton.active = true;
        visibility_buttons.appendChild(anyButton);

        var privateButton = new se.ToggleButton({iconClass: 'fa fa-lock', title: 'Private Dashboards'});
        privateButton.addEventListener('click', function () {
            anyButton.active = false;
            privateButton.active = true;
            sharedButton.active = false;
            publicButton.active = false;
            source.refresh();
        });
        visibility_buttons.appendChild(privateButton);

        var sharedButton = new se.ToggleButton({iconClass: 'fa fa-share-alt', title: 'Shared Dashboards'});
        sharedButton.addEventListener('click', function () {
            anyButton.active = false;
            privateButton.active = false;
            sharedButton.active = true;
            publicButton.active = false;
            source.refresh();
        });
        visibility_buttons.appendChild(sharedButton);

        var publicButton = new se.ToggleButton({iconClass: 'fa fa-globe', title: 'Public Dashboards'});
        publicButton.addEventListener('click', function () {
            anyButton.active = false;
            privateButton.active = false;
            sharedButton.active = false;
            publicButton.active = true;
            source.refresh();
        });
        visibility_buttons.appendChild(publicButton);
    }

    layout.center.addClassName('loading');

    var pagination = new se.PaginationInterface(source);
    layout.south.appendChild(pagination);

    source.refresh();

})(MashupPlatform, StyledElements);
