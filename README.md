# CG_Pro3_Ray_Tracing

## Objective

To implement a guy made up of several cubes, walking along a circle on
checkerboard.

## Source Files

The main code is written in 
[js/proj2.js](https://github.com/Dapeng-XU/CG_Pro2_A_Walking_Match/blob/master/js/proj2.js)
. The other JavaScript file 
[js/tools.js](https://github.com/Dapeng-XU/CG_Pro2_A_Walking_Match/blob/master/js/tools.js)
contains some auxiliary code, which is created when I coded another 
project last year.

## Used third-party libraries

*   Three.js: v0.84.0

*   jQuery: 3.1.1

## Critical technics

1.  __Object oriented programming(OOP)__

    Although the topic is computer graphics, I think the technics that helps
    me save time is OOP. Also, in order to use OOP, it is necessary to
    distinguish what is an object and what is a class.
    
    In my model, the guy may rotate along the Y axis or translate on the 
    checkerboard which is covered the XZ plane exactly. For the guy himself,
    his head and his belly will never move, and his arms and his legs obey the
    similar rules during the walking cycle. Both the arms and the legs are
    made up of two cubes: one connected to the belly(central part), another
    far from the belly(circular part). The class BodyPart is designed for the
    arms and the legs. The class WalkingMatch is designed for the whole body.

2.  __3D transformations: translations and rotations__

    Every time drawing the frame, we need to traverse the objects in the scene 
    and compute the position and the angle of each object. Both the position
    and the angle are relative to the time. In this project, we use the number
    of frames we have produced to represent the time. 
     
    For each object, we first calculate its position and angle, then reset the
    matrix of this object so that it is put on the original point. Next, we
    rotate it to a specific direction. After rotating, we translate to the
    right position, then we get the result. The function called above is in
    the following list(not in the real called order).

    *   _Three.js_ Matrix4.setPosition(Vector3)
    *   _Three.js_ Matrix4.makeRotationX/Y/Z(_Angle in radians_)
    *   _Three.js_ Matrix4.premultiply(Matrix4)
    *   _Three.js_ Matrix4.copy(Matrix4)

3.  __Adjust the parameters__

    To make the guy behave like a man, I adjust a lots of parameters according
    to the data collected in the scientific experiments. These can be found in
    the website Wikipedia.
    
    *   [Body Proportions](https://en.wikipedia.org/wiki/Body_proportions)
    *   [Walking](https://en.wikipedia.org/wiki/Walking)

## Other problems

If you have any problem about this project, please send me a mail.
