# How to program your own World

## The file `world.xml`

First create a directory for the world. We assume it is called `example`.

Inside `example` create a file `world.xml` and copy the following content:

``` 
<?xml version="1.0" encoding="UTF-8"?>
<world id="example">
   <name>Example World</name>
   <description>This world is a simple example.</description>
</world>
```

The id of the world inside abbozza! is the id of the world tag.

`<name>` contains the display name, i.e. a short text which is displayed in 
menus and the gui.

`<description>` contains a longer description.

## The World-View

Each world comes with a *View*, i.e. an object of the class `World` which
provides a graphical representation an a series of operations to manipulate it.
The JavaScript class defining this object is given in `World.js`. This file
should contain the whole code for the world.

The world should consist of the following object and classes.

### `World`
The object `World` is an instance of the class `AbbozzaWorld`. This wrapper
object may contain a series of operations that provide specific behavior of the
world. These are defined inside the file `World.js`.

Create the file `World.js` inside the directory.

The It is created by the follwing line of code:
```javascript
var World = new AbbozzaWorld("example");
```

Each world requires ain operation `init(view)` which attaches the world to the
given view, usually a DIV-element. 

```javascript
World.init = function(view) {
    // Setup the view for the world
    
};
```


## Adding options

To add one or more options to a world, add a tag `<options>` to `world.xml`.

```
<options>
   <item name="example_option" option="expopt" default="false"/>
   <group name="grouped_option">
       <item name="optionA" option="opta" default="false"/>
       <item name="optionB" option="optb" default="true"/>
   </group>
</options>
```