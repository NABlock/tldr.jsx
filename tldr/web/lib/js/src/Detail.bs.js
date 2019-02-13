// Generated by BUCKLESCRIPT VERSION 4.0.18, PLEASE EDIT WITH CARE
'use strict';

var List = require("bs-platform/lib/js/list.js");
var $$Array = require("bs-platform/lib/js/array.js");
var ReasonReact = require("reason-react/lib/js/src/ReasonReact.js");
var Text$ReactTemplate = require("./Text.bs.js");
var Column$ReactTemplate = require("./Column.bs.js");
var Spacer$ReactTemplate = require("./Spacer.bs.js");

var component = ReasonReact.statelessComponent("Title");

function make(pars, _children) {
  return /* record */[
          /* debugName */component[/* debugName */0],
          /* reactClassInternal */component[/* reactClassInternal */1],
          /* handedOffState */component[/* handedOffState */2],
          /* willReceiveProps */component[/* willReceiveProps */3],
          /* didMount */component[/* didMount */4],
          /* didUpdate */component[/* didUpdate */5],
          /* willUnmount */component[/* willUnmount */6],
          /* willUpdate */component[/* willUpdate */7],
          /* shouldUpdate */component[/* shouldUpdate */8],
          /* render */(function (self) {
              return ReasonReact.element(undefined, undefined, Column$ReactTemplate.make(/* Top_down */164851116, /* array */[$$Array.of_list(List.rev(List.tl(List.fold_left((function (acc, e) {
                                                  return /* :: */[
                                                          ReasonReact.element(undefined, undefined, Spacer$ReactTemplate.make(/* M */77, /* array */[])),
                                                          /* :: */[
                                                            e,
                                                            acc
                                                          ]
                                                        ];
                                                }), /* [] */0, List.map((function (p) {
                                                      return ReasonReact.element(undefined, undefined, Text$ReactTemplate.make(/* Detail */0, /* array */[p]));
                                                    }), pars)))))]));
            }),
          /* initialState */component[/* initialState */10],
          /* retainedProps */component[/* retainedProps */11],
          /* reducer */component[/* reducer */12],
          /* jsElementWrapped */component[/* jsElementWrapped */13]
        ];
}

var Style = 0;

exports.Style = Style;
exports.component = component;
exports.make = make;
/* component Not a pure module */