//--------------- import --------------//
import 'dep1';
import "dep2";
import A from 'dep3';
import { B } from 'dep4';
import { D, [ C ] } from 'dep5';

//--------------- require --------------//
require('dep6');
require("dep7");
require( "dep8" );
require ( "dep9" );
require.resolve("dep10");

//--------------- for ignore --------------//
require('ignore-this');
require('ignore-that');

//--------------- for builtin-modules --------------//
require('fs');
require('path');

//--------------- for already defined --------------//
require('defined1');
require('defined2');

//--------------- in-comment --------------//

// import 'will-not-resolve1';
// require('will-not-resolve2');

/**
 * import 'will-not-resolve3';
 * require('will-not-resolve4');
 */
