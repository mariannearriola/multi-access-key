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

## Creating a dichotomous key

A dichotomous key is a tool that allows the user to identify organisms based on information given. It does this by offering two statements, one of which must apply to the organism in question. For example, if the the specimen was a dog, one of the first questions a dichotomous key might ask is: is it a plant or an animal? Then, a dichotomous key would ask if said organism applies to smaller groups until the species in question is finally reached.

Below is a simple dichotmous key that identifies the phylum of a species based on domain and kingdom.

```prolog
aSimpleDichotomousKey :- identify.

identify:-
	retractall(known(_,_,_)),                   % Resets any past 'knowns' without having to re-consult the program
	phylum(X),                                  % phylum target/final group that needs to be reached. This initiates the identification program to be run.
	write('The species is in '),write(X),nl.    % Once the phylum value is found, a final statement is given.
identify:-
	write('No species was identified'),nl.      % If no phylum value is found, a final statement is given.

phylum([cyanobacteria,proteobacteria]):-            % Three phyla (target groups) and the domain and kingdom that they belong to is given within each rule.
	domain(bacteria),
	kingdom(eubacteria).
phylum(forams):-
	domain(eukarya),
	kingdom(protista).
phylum(moss):-
	domain(eukarya),
	kingdom(plantae).

	domain(X):- ask(domain,X).                  % Information that must be provided by the user.
	kingdom(X):- ask(kingdom,X).

	ask(Attribute,Value):-                      % If the value is already true for the attribute given, then the value won't be asked for again and the program will narrow down the field.
		known(yes,Attribute,Value),
		!.
	ask(Attribute,Value):-                      % If the value is false for the attribute given, then the value won't be asked for again and the phylum that the statement is in is false.
		known(_,Attribute,Value),
		!, fail.
	ask(Attribute,_):-                          % If the value is already false for the attribute given, then no species is identified and the program will not ask for values of a larger scope.
		known(yes,Attribute,_),
		!, fail.
	ask(A,V):-                                  % If no value is given for the attribute (domain,kingdom), then the value is asked for.
 		write(A:V),                     
  		write('? (yes or no): '),
  		read(Y),                       
  		asserta(known(Y,A,V)),           
  		Y = yes.
```

The problem with this key is that there is a lack of flexibility when it comes to the user experience. For example, a user might not know the domain that an organism is in but might know the kingdom. In addition, with large sets of data, the user would be forced to evaluate behemoths of characteristics to classify certain organisms.

A multi-access key, however, would fix these problems. A user would be able to freely choose certain characteristics to be identified, and in whatever order. If only a few characteristics are picked, then a multi-access key would give insight as to which organisms fit the given criteria.

Although there has been little success with a digital multi-access key, my project aims to create such a product using logical implications in Prolog.
