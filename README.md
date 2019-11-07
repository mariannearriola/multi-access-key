# Digital Multi-Access Key

Species identification key which enables the user to freely choose the characteristics of a species that are convenient to evaluate for recognition.

## Prolog

Prolog is a logic programming language (PROgramming in LOgic) associated with artificial intelligence and computational logistics. It is significantly different from conventional procedural programming. Essentially, logical relationships are asserted and Prolog is used to determine whether certain statements are true, and if true, what variable bindings make them true.

Prolog is an ideal language for this project because of the fact that traits can be logically linked by implications. This enables a digital multi-access key to have more flexibility in drawing conclusions from the information given by the user.

## Installing SWI-Prolog

[Click here to travel to the installation page.](https://www.swi-prolog.org/download/stable)

## Coding in Prolog

Open a file and name it hello_world.pro. Then create the following rule:

```prolog
hello_world :-
  location(world).
  location(X) = world -> write('Hello world').  
```
A rule is a predicate expression that uses logical implication (:-) to describe a relationship among facts. In this case, location is a predicate and world is an argument. Therefore, the fact is that the one location contained is world. The code above can be interpreted as: hello_world if 'Hello, World!' location is world. The second clause is essentially an if statement: if location is world, then the program will print 'Hello world'.

To 'consult' the source code, the Prolog Listener will be used. Save the file and start the Listener. The following prompt should be shown:

```prolog
?-
```

Consulting the file will load the file to the listener. This can be done directly from the listener with the query:

```prolog
?- consult(hello_world).
yes
```

The listener will return either yes or no: yes if the query can be proven true and no if not.

As shown above, hello_world was consulted. We can then run the file:

```prolog
?- hello_world.
Hello world

yes
```

hello_world was run successfully and the query was proven true. As 'Hello world' was printed, we know that location must be world. We can use a logical variable to find all of the locations that exist in the program:

```prolog
?- location(X).

X = world

yes
```

The query was run successfully and we can confirm location has world.

## Creating a simple multi-access key

A multi-access key enables the user to freely choose the characteristics that are convenient to evaluate for the item to be identified. However, there are few multi-access keys available because achieving dynamic relationships between groups is difficult when using traditional database languages such as SQL. Prolog, however, is able to overcome this barrier by relying on predicate logic.

Below is a simple logicbase that defines the relationships between animals, fish, birds, and parrots.

```prolog
% Attatches Logtalk pack
:- use_module(library(prolog_pack)).
:- attach_packs(user:file_search_path(logtalk, app_data(logtalk))).

% Animal object
:- object(animal).

    :- public(covering/1).
    covering(skin).  % default covering

    :- public(travel/1).

:- end_object.

% Fish object that inherits from animal
:- object(fish, extends(animal)).

    travel(swim).

:- end_object.

% Bird object that inherits from animal
:- object(bird, extends(animal)).

    covering(feathers).
    travel(fly).

    :- public(color/1).

:- end_object.

% Parrot object that inherits from bird and animal
:- object(parrot, extends(bird)).

    color(bright).

:- end_object.

```

Queries can be run to retrieve various facts from the logicbase dynamically:

```prolog
?- extends_object(Object,animal).

Object = fish ;
Object = bird.
```
The above query returns all of the objects that inherit from animal directly.

```prolog
?- parrot::current_predicate(Name/Arity).

Name = color,
Arity = 1 ;
Name = covering,
Arity = 1 ;
Name = travel,
Arity = 1 ;
```
This query returns all of the names of the properties of parrot, including those inherited by the bird and animal objects.

```prolog
?- animal::predicate_property(covering(_),Property).

Property = logtalk ;
Property = scope(public) ;
Property =  (public) ;
Property = static ;
Property = declared_in(animal) ;
Property = declared_in(animal, 6) ;
Property = defined_in(animal) ;
Property = defined_in(animal, 7) ;
Property = number_of_clauses(1) ;
Property = number_of_rules(0).
```
This query returns all of the properties of a specific predicate.

```prolog
?- current_object(Object), Object::current_predicate(travel/1),functor(Property,travel,1),Object::Property.

Object = user,
Property = travel(swim) ;
Object = user,
Property = travel(fly) ;
Object = fish,
Property = travel(swim) ;
Object = bird,
Property = travel(fly) ;
Object = parrot,
Property = travel(fly).
```
The above query returns all of the objects that travel.

```prolog
?- current_object(Object), Object::current_predicate(travel/1), Object::current_predicate(color/1), functor(travel(fly),travel,1), functor(color(bright), color, 1), Object::travel(fly), Object::color(bright).

Object = user ;
Object = parrot.
```
This query returns all of the objects that travel by flying and have a bright color, which is only parrot.
