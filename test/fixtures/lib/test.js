//--------------- import --------------//
import 'dep1';
import "dep2";
import A from 'dep3';
import { B } from 'dep4';
import { D, [ C ] } from 'dep5';

//--------------- require --------------//
require('dep6');
require("dep7/a/b/c");
require( "dep8/a/b/c.js" );
require ( "dep9/xxx/main.jsx" );
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

// require('will-not-resolve3');

// @example:  require('enquire.js')

/**
 * import 'will-not-resolve3';
 * require('will-not-resolve4');
 */

//------------- complex keywords -----------//
parent.walkAtRules('import', node => {
  const file = node.source.input.file || '';

  console.log('import "lib/xxx.json"')
})
