# Digital Multi-Access Key

Species identification key which enables the user to freely choose the characteristics of a species that are convenient to evaluate for recognition.

## Prolog

Prolog is a logic programming language (PROgramming in LOgic) associated with artificial intelligence and computational logistics. It is significantly different from conventional procedural programming. Essentially, logical relationships are asserted and Prolog is used to determine whether certain statements are true, and if true, what variable bindings make them true.

Prolog is an ideal language for this project because of the fact that traits can be logically linked by implications. This enables a digital multi-access key to have more flexibility in drawing conclusions from the information given by the user.

## Installing Amzi! Prolog + Logic Server + IDE

[Click here to travel to the installation page.](https://amzi.com/AmziOpenSource/downloads.php)

Extract all downloaded files and complete the following navigations.

```
amzi_apls_(etc) -> apls -> bin -> wideA
```

This should open the Amzi! Development Environment.

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

## Creating a dichotomous key

A dichotomous key is a tool that allows the user to identify organisms based on information given. It does this by offering two statements, one of which must apply to the organism in question. For example, if the the specimen was a dog, one of the first questions a dichotomous key might ask is: is it a plant or an animal? Then, a dichotomous key would ask if said organism applies to smaller groups until the species in question is finally reached.

```prolog
aSimpleDichotomousKey :- identify.

identify:-
	retractall(known(_,_,_)),
	phylum(X),
	write('The species is in '),write(X),nl.
identify:-
	write('idk'),nl.

phylum([cyanobacteria,proteobacteria]):-
	domain(bacteria),
	kingdom(eubacteria).
phylum(forams):-
	domain(eukarya),
	kingdom(protista).
phylum(moss):-
	domain(eukarya),
	kingdom(plantae).

	domain(X):- ask(domain,X).
	kingdom(X):- ask(kingdom,X).

	ask(Attribute,Value):-
		known(yes,Attribute,Value),
		!.
	ask(Attribute,Value):-
		known(_,Attribute,Value),
		!, fail.
	ask(Attribute,_):-
		known(yes,Attribute,_),
		!, fail.
	ask(A,V):-
 		write(A:V),                     
  		write('? (yes or no): '),
  		read(Y),                       
  		asserta(known(Y,A,V)),           
  		Y = yes.    

	menuask(Attribute,Value,_):-
		known(yes,Attribute,Value),
		!.
	menuask(Attribute,_,_):-
		known(yes,Attribute,_),
		!, fail.
	display_menu(Menu):-
		disp_menu(1,Menu), !.
	disp_menu(_,[]).
	disp_menu(N,[Item | Rest]):-
		write(N),write(' : '),write(Item),nl,
		NN is N + 1,
		disp_menu(NN,Rest).

	pick_menu(N,Val,Menu):-
		integer(N),
		pic_menu(1,N,Val,Menu), !.
		pick_menu(Val,Val,_).
	pic_menu(_,_,none_of_the_above,[]).
	pic_menu(N,N,Item,[Item|_]).
	pic_menu(Ctr,N,Val,[_|Rest]):-
		NextCtr is Ctr + 1,
		pic_menu(NextCtr,N,Val,Rest).
```