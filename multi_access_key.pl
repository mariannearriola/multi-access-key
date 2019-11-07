:- use_module(library(prolog_pack)).
:- attach_packs(user:file_search_path(logtalk, app_data(logtalk))).

:- object(animal).

    :- public(covering/1).
    covering(skin).  % default covering

    :- public(travel/1).

:- end_object.


:- object(fish, extends(animal)).

    travel(swim).

:- end_object.


:- object(bird, extends(animal)).

    covering(feathers).
    travel(fly).

    :- public(color/1).

:- end_object.

:- object(parrot, extends(bird)).

    color(bright).

:- end_object.










