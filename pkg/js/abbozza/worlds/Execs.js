
/**************************
 * CONTROL blocks 
 **************************/

AbbozzaInterpreter.exec["loop_endless"] = function(entry) {
  if ( AbbozzaInterpreter.breakLoop )  {
      entry.finished();
      AbbozzaInterpreter.breakLoop = false;
      return true;
  }
  
  AbbozzaInterpreter.callStatement(this,"STATEMENTS");
};

AbbozzaInterpreter.exec["loop_break"] = function(entry) {
    AbbozzaInterpreter.breakLoop = true;
    entry.finished();
}

AbbozzaInterpreter.exec["loop_fixed"] = function(entry) {
  if ( AbbozzaInterpreter.breakLoop )  {
      entry.finished();
      AbbozzaInterpreter.breakLoop = false;
      return true;
  }
  
  if ( entry.phase == 0 ) {
    // Determine the number of executions (checked only at the start
    AbbozzaInterpreter.callInput(this,"COUNT","NUMBER");
    entry.phase = 1;
  } else if ( entry.phase == 1 ) {
    // Store the number of rounds
    entry.count = entry.callResult;
    if ( entry.count > 0 ) {
        AbbozzaInterpreter.callStatement(this,"STATEMENTS");
        entry.count--;
        entry.phase = 2;
    } else {
        entry.finished();
    }
  } else if ( entry.phase == 2 ) {
    if ( entry.count > 0 ) {
        AbbozzaInterpreter.callStatement(this,"STATEMENTS");
        entry.count--;
    } else {
        entry.finished();         
    }
  } else {
    entry.finished();
  }
};


AbbozzaInterpreter.exec["loop_while"] = function(entry) {
  if ( AbbozzaInterpreter.breakLoop )  {
      entry.finished();
      AbbozzaInterpreter.breakLoop = false;
      return true;
  }
  
  if ( entry.phase == 0 ) {
      AbbozzaInterpreter.callInput(this,"CONDITION","BOOLEAN");
      entry.phase = 1;
  } else if ( entry.phase == 1 ) {
      if ( entry.callResult == true ) {
          AbbozzaInterpreter.callStatement(this,"STATEMENTS");
          entry.phase = 0;
      } else {
          entry.finished();
      }
  } 
};


AbbozzaInterpreter.exec["loop_do_while"] = function(entry) {
  if ( AbbozzaInterpreter.breakLoop )  {
      entry.finished();
      AbbozzaInterpreter.breakLoop = false;
      return true;
  }
  
  if ( entry.phase == 0 ) {
      AbbozzaInterpreter.callStatement(this,"STATEMENTS");
      entry.phase = 1;
  } else if ( entry.phase == 1 ) {
      AbbozzaInterpreter.callInput(this,"CONDITION","BOOLEAN");
      entry.phase = 2;
  }  else if ( entry.phase == 2 ) {
      if ( entry.callResult == true ) {
          AbbozzaInterpreter.callStatement(this,"STATEMENTS");
          entry.phase = 1;
      } else {
          entry.finished();
      }
  } 
};


AbbozzaInterpreter.exec["loop_count_dir"] = function(entry) {
  if ( AbbozzaInterpreter.breakLoop )  {
      entry.finished();
      AbbozzaInterpreter.breakLoop = false;
      return true;
  }
  
  var current;
  
  switch ( entry.phase ) {
      case 0 : 
          entry.name = this.getFieldValue("VAR");
          entry.dir = this.getFieldValue("DIR");
          AbbozzaInterpreter.callInput(this,"FROM","NUMBER")
          entry.phase = 1;
          break;
      case 1 :
          entry.from = entry.callResult;
          AbbozzaInterpreter.callInput(this,"TO","NUMBER");
          AbbozzaInterpreter.setSymbol(entry.name,entry.from);
          entry.phase = 2;
          break;
      case 2 :
          // Fetch current value
          current = AbbozzaInterpreter.getSymbol(entry.name);
          var cont = true;
          if ( entry.dir == "ASC" ) {
              if ( current > entry.callResult ) {
                  cont = false;
              }
          } else {
              if ( current < entry.callResult ) {
                  cont = false;
              }              
          }
          if ( cont ) {
              AbbozzaInterpreter.callStatement(this,"STATEMENTS");
              entry.phase = 3;
          } else {
              entry.finished();
          }
          break;
      case 3 :         
          current = AbbozzaInterpreter.getSymbol(entry.name);
          if ( entry.dir == "ASC" ) {
              current++;
          } else {
              current--;
          }
          AbbozzaInterpreter.setSymbol(entry.name,current);
          AbbozzaInterpreter.callInput(this,"TO","NUMBER");
          entry.phase = 2;
          break;
      default:
          entry.finished();
  }
};


AbbozzaInterpreter.exec["loop_count_dir_step"] = function(entry) {
  if ( AbbozzaInterpreter.breakLoop )  {
      entry.finished();
      AbbozzaInterpreter.breakLoop = false;
      return true;
  }
  
  var current;
  
  switch ( entry.phase ) {
      case 0 : 
          entry.name = this.getFieldValue("VAR");
          entry.dir = this.getFieldValue("DIR");
          AbbozzaInterpreter.callInput(this,"FROM","NUMBER")
          entry.phase = 1;
          break;
      case 1 :
          entry.from = entry.callResult;
          AbbozzaInterpreter.callInput(this,"TO","NUMBER");
          AbbozzaInterpreter.setSymbol(entry.name,entry.from);
          entry.phase = 2;
          break;
      case 2 :
          // Fetch current value
          current = AbbozzaInterpreter.getSymbol(entry.name);
          var cont = true;
          if ( entry.dir == "ASC" ) {
              if ( current > entry.callResult ) {
                  cont = false;
              }
          } else {
              if ( current < entry.callResult ) {
                  cont = false;
              }              
          }
          if ( cont ) {
              AbbozzaInterpreter.callStatement(this,"STATEMENTS");
              entry.phase = 3;
          } else {
              entry.finished();
          }
          break;
      case 3 :         
          AbbozzaInterpreter.callInput(this,"STEP","NUMBER");
          entry.phase = 4;
          break;
      case 4 :         
          current = AbbozzaInterpreter.getSymbol(entry.name);
          if ( entry.dir == "ASC" ) {
              current = current + entry.callResult;
          } else {
              current = current - entry.callResult;
          }
          AbbozzaInterpreter.setSymbol(entry.name,current);
          AbbozzaInterpreter.callInput(this,"TO","NUMBER");
          entry.phase = 2;
          break;
      default:
          entry.finished();
  }
};


AbbozzaInterpreter.exec["cond_if"] = function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"CONDITION","BOOLEAN");
            entry.phase = 1;
        } else if ( entry.phase == 1 ) {
            if ( entry.callResult == true ) {
                AbbozzaInterpreter.callStatement(this,"STATEMENTS");
                entry.phase = 2;
            } else {
                entry.finished();
            }
        } else {
            entry.finished();
        }
        
        return true;    
};


AbbozzaInterpreter.exec["cond_if_else"] = function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"CONDITION","BOOLEAN");
            entry.phase = 1;
        } else if ( entry.phase == 1 ) {
            if ( entry.callResult == true ) {
                AbbozzaInterpreter.callStatement(this,"STATEMENTS1");
                entry.phase = 2;
            } else {
                AbbozzaInterpreter.callStatement(this,"STATEMENTS2");
                entry.phase = 2;
            }
        } else {
            entry.finished();
        }
        
        return true;    
};


/*************************
 * VARIABLE blocks
 *************************/

AbbozzaInterpreter.exec["var_block"] = function(entry) {
    if ( entry.phase == 0 ) {
        entry.name = this.getFieldValue("NAME");
        entry.dim = [];
        if ( this.getInput("DIM0") ) {
            entry.no = 0;
            AbbozzaInterpreter.callInput(this, 'DIM' + entry.no, "NUMBER");
            entry.phase = 1;
        } else {
            entry.phase = 2;
        }
    } else if ( entry.phase == 1 ) {
        var index = entry.callResult;
        entry.dim.push(index);        
        entry.no++;
        if ( this.getInput("DIM" + entry.no ) ) {
            var index = AbbozzaInterpreter.callInput(this, 'DIM' + entry.no, "NUMBER");
        } else {
            entry.phase = 2;
        }
    } else if ( entry.phase == 2 ) {
        if ( entry.dim.length == 0 ) {
            entry.dim = null;
        }
        if ( entry.enfType == "VAR") {
            // Return an array continaing the name and the dimensions
            var ar = [];
            ar.push(entry.name);
            ar.push(entry.dim);
            entry.returnValue = ar;
            entry.finished();
        } else {
            // Return the value
            entry.returnValue = AbbozzaInterpreter.getSymbol(entry.name,entry.dim);
            entry.finished();
        }
    }
};

AbbozzaInterpreter.exec["var_assign"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            AbbozzaInterpreter.callInput(this,"LEFT","VAR");
            entry.phase = 1;
            break;
        case 1 :
            entry.var = entry.callResult;
            console.log(entry.callResult);
            AbbozzaInterpreter.callInput(this,"RIGHT");
            entry.phase = 2;
            break;
        case 2 :
            console.log(entry.callResult);
            AbbozzaInterpreter.setSymbol(entry.var[0],entry.callResult,entry.var[1]);
            console.log(AbbozzaInterpreter.globalSymbols);
            entry.finished();
            break;
    }
};

/*************************
 * MATH blocks
 *************************/

AbbozzaInterpreter.exec["math_number"] = function(entry) {
    entry.returnValue = Number(this.getFieldValue("VALUE"));
    entry.finished();
};

AbbozzaInterpreter.exec["math_decimal"] = function(entry) {
    entry.returnValue = Number(this.getFieldValue("VALUE"));
    entry.finished();
};

AbbozzaInterpreter.exec["math_calc"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            entry.op = this.getFieldValue("OP");
            AbbozzaInterpreter.callInput(this,"LEFT","NUMBER");
            entry.phase = 1;
            break;
        case 1:
            entry.left = Number(entry.callResult);
            AbbozzaInterpreter.callInput(this,"RIGHT","NUMBER");
            entry.phase = 2;
            break;
        case 2:
            if ( entry.op == "PLUS" ) {
                entry.returnValue = entry.left + entry.callResult;
            } else if ( entry.op == "MINUS" ) {
                entry.returnValue = entry.left - entry.callResult;
            } else if ( entry.op == "MULT" ) {
                entry.returnValue = entry.left * entry.callResult;
            } else if ( entry.op == "DIV" ) {
                entry.returnValue = entry.left / entry.callResult;
            } else if ( entry.op == "MOD" ) {
                entry.returnValue = entry.left % entry.callResult;
            } else if ( entry.op == "POWER" ) {
                entry.returnValue = Math.pow(entry.left,entry.callResult);
            }
            entry.finished();
            break;
        default:
            entry.finished();
    }
};

AbbozzaInterpreter.exec["math_round"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            entry.op = this.getFieldValue("OP");
            AbbozzaInterpreter.callInput(this,"ARG","NUMBER");
            entry.phase = 1;
            break;
        case 1 :
            if ( entry.op == "ROUND" ) {
                entry.returnValue = Math.round(entry.callResult);
            } else if ( entry.op == "FLOOR" ) {
                entry.returnValue = Math.floor(entry.callResult);
                
            } else if ( entry.op == "CEIL" ) {
                entry.returnValue = Math.ceil(entry.callResult);                
            }
            entry.finished();
            break;
        default :
            entry.finished();            
    }
};


AbbozzaInterpreter.exec["math_unary"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            entry.op = this.getFieldValue("OP");
            AbbozzaInterpreter.callInput(this,"ARG","NUMBER");
            entry.phase = 1;
            break;
        case 1 :
            if ( entry.op == "ABS" ) {
                entry.returnValue = Math.abs(entry.callResult);
            } else if ( entry.op == "SIN" ) {
                entry.returnValue = Math.sin(Math.PI * entry.callResult / 180);                
            } else if ( entry.op == "COS" ) {
                entry.returnValue = Math.cos(Math.PI * entry.callResult / 180);                
            } else if ( entry.op == "TAN" ) {
                entry.returnValue = Math.tan(Math.PI * entry.callResult / 180);                
            } else if ( entry.op == "SQRT" ) {
                entry.returnValue = Math.sqrt(entry.callResult);                
            }
            entry.finished();
            break;
        default :
            entry.finished();            
    }
};

AbbozzaInterpreter.exec["math_unary_x"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            entry.op = this.getFieldValue("OP");
            AbbozzaInterpreter.callInput(this,"ARG","NUMBER");
            entry.phase = 1;
            break;
        case 1 :
            if ( entry.op == "ABS" ) {
                entry.returnValue = Math.abs(entry.callResult);
            } else if ( entry.op == "SIN" ) {
                entry.returnValue = Math.sin(Math.PI * entry.callResult / 180);                
            } else if ( entry.op == "COS" ) {
                entry.returnValue = Math.cos(Math.PI * entry.callResult / 180);                
            } else if ( entry.op == "TAN" ) {
                entry.returnValue = Math.tan(Math.PI * entry.callResult / 180);                
            } else if ( entry.op == "SQRT" ) {
                entry.returnValue = Math.sqrt(entry.callResult);                
            } else if ( entry.op == "ASIN" ) {
                entry.returnValue = Math.PI * Math.asin(entry.callResult) / 180;                
            } else if ( entry.op == "ACOS" ) {
                entry.returnValue = Math.PI * Math.acos(entry.callResult) / 180;                
            } else if ( entry.op == "ATAN" ) {
                entry.returnValue = Math.PI * Math.atan(entry.callResult) / 180;                
            }
            entry.finished();
            break;
        default :
            entry.finished();            
    }
};


AbbozzaInterpreter.exec["math_binary"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            entry.op = this.getFieldValue("OP");
            AbbozzaInterpreter.callInput(this,"FIRST","NUMBER");
            entry.phase = 1;
            break;
        case 1:
            entry.left = entry.callResult;
            AbbozzaInterpreter.callInput(this,"SECOND","NUMBER");
            entry.phase = 2;
            break;
        case 2:
            if ( entry.op == "MIN" ) {
                entry.returnValue = Math.min(entry.left,entry.callResult);
            } else if ( entry.op == "MAX" ) {
                entry.returnValue = Math.max(entry.left,entry.callResult);
            }
            entry.finished();
            break;
        default:
            entry.finished();
    }
};

AbbozzaInterpreter.exec["math_random"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            AbbozzaInterpreter.callInput(this,"MAX","NUMBER");
            entry.phase = 1;
            break;
        case 1 :
            console.log(entry.callResult);
            var x = Math.random();
            console.log(x);
            console.log(x * (entry.callResult + 1));
            entry.returnValue = Math.floor( x * (entry.callResult + 1) );
            entry.finished();
            break;
        default :
            entry.finished();            
    }
};

AbbozzaInterpreter.exec["math_random2"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            AbbozzaInterpreter.callInput(this,"MIN","NUMBER");
            entry.phase = 1;
            break;
        case 1 :
            entry.min = entry.callResult;
            console.log(entry.min);
            AbbozzaInterpreter.callInput(this,"MAX","NUMBER");
            entry.phase = 2;
            break;
        case 2 :
            console.log(entry.callResult);
            entry.returnValue = Math.floor( Math.random() * ((entry.callResult - entry.min) + 1)) + entry.min;
            entry.finished();
            break;
        default :
            entry.finished();            
    }
};

AbbozzaInterpreter.exec["math_randomseed"] = function(entry) {
    entry.finished();
};

AbbozzaInterpreter.exec["math_millis"] = function(entry) {
    var d = new Date();
    entry.returnValue = d.getMilliseconds(); 
    entry.finished();
};


/*************************
 * TEXT blocks
 *************************/

AbbozzaInterpreter.exec["text_const"] = function(entry) {
    entry.returnValue = this.getFieldValue("CONTENT");
    entry.finished();
};


AbbozzaInterpreter.exec["text_char_at"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"POS","NUMBER");
            entry.phase = 1;
            break;
        case 1:
            // Get the second one
            entry.pos = entry.callResult;
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 2;
            break;
        case 2:
            entry.returnValue  = entry.callResult.charAt(entry.pos); 
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};


AbbozzaInterpreter.exec["text_concat"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"TEXT1");
            entry.phase = 1;
            break;
        case 1:
            // Get the second one
            entry.first = entry.callResult;
            AbbozzaInterpreter.callInput(this,"TEXT2");
            entry.phase = 2;
            break;
        case 2:
            entry.returnValue  = entry.first + entry.callResult; 
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};

AbbozzaInterpreter.exec["text_from_number"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
            break;
        case 1:
            entry.returnValue  = String(entry.callResult); 
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};


AbbozzaInterpreter.exec["text_to_number"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 1;
            break;
        case 1:
            entry.returnValue  = Number(entry.callResult); 
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};


AbbozzaInterpreter.exec["text_from_ascii"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
            break;
        case 1:
            entry.returnValue  = String.fromCharCode(entry.callResult);
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};

AbbozzaInterpreter.exec["ascii_from_text"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 1;
            break;
        case 1:
            entry.returnValue = entry.callResult.charCodeAt(0);
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};

AbbozzaInterpreter.exec["ascii_from_text_pos"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"POS","NUMBER");
            entry.phase = 1;
            break;
        case 1 :
            // Get the first one
            entry.pos = entry.callResult;
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 2;
            break;
        case 2:
            entry.returnValue = entry.callResult.charCodeAt(entry.pos);
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};


AbbozzaInterpreter.exec["text_length"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 1;
            break;
        case 1:
            entry.returnValue = entry.callResult.length;
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};


AbbozzaInterpreter.exec["text_substring"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 1;
            break;
        case 1:
            entry.text = entry.callResult;
            AbbozzaInterpreter.callInput(this,"FROM","NUMBER");
            entry.phase = 2;
            break;
        case 2:
            entry.from = entry.callResult;
            AbbozzaInterpreter.callInput(this,"TO","NUMBER");
            entry.phase = 3;
            break;
        case 3:
            entry.returnValue = entry.text.slice(entry.from,entry.callResult);
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};


AbbozzaInterpreter.exec["text_is_empty"] = function(entry) {
    switch ( entry.phase ) {
        case 0:
            // Get the first one
            AbbozzaInterpreter.callInput(this,"TEXT","STRING");
            entry.phase = 1;
            break;
        case 1:
            entry.returnValue = ( entry.callResult == "" );
            entry.finished();
            break;
        default:
            return false;
    }
    return true;
};

/*************************
 * LOGIC blocks
 *************************/


AbbozzaInterpreter.exec["logic_const"] = function(entry) {
    var val = this.getFieldValue("NAME");
    if ( val == "TRUE" ) {
        entry.returnValue = true;
    } else {
        entry.returnValue = false;
    }
    entry.finished();
};


AbbozzaInterpreter.exec["logic_op"] = function(entry) {
    entry.op = this.getFieldValue("LOGOP");
    switch ( entry.phase ) {
        case 0 : 
            AbbozzaInterpreter.callInput(this,"LEFT");
            entry.phase = 1;
            break;
        case 1 :
            entry.left = entry.callResult;
            if ( (entry.op == "AND") && (entry.left == false) ) {
                entry.returnValue = false;
                entry.finished();
            } else if ( (entry.op == "OR") && (entry.left == true) ) {
                entry.returnValue = true;
                entry.finished();
            } else {
                AbbozzaInterpreter.callInput(this,"RIGHT");
                entry.phase = 2;
            }
            break;
        case 2 :
            if ( entry.op == "AND" ) {
                entry.returnValue = (entry.callResult && entry.left);
                entry.finished();
            } else if ( entry.op == "OR" ) {
                entry.returnValue = (entry.callResult || entry.left);
                entry.finished();
            }
            break;
        default:
            entry.finished();
    }
};


AbbozzaInterpreter.exec["logic_not"] = function(entry) {
    switch ( entry.phase ) {
        case 0 : 
            AbbozzaInterpreter.callInput(this,"ARG");
            entry.phase = 1;
            break;
        case 1 :
            entry.returnValue = (!entry.callResult);
            entry.finished();
            break;
        default:
            entry.finished();
    }
};


AbbozzaInterpreter.exec["logic_compare"] = function(entry) {
    switch ( entry.phase ) {
        case 0 : 
            entry.op = this.getFieldValue("OP");
            AbbozzaInterpreter.callInput(this,"LEFT");
            entry.phase = 1;
            break;
        case 1 :
            entry.left = entry.callResult;
            console.log("left : " + entry.left);
            AbbozzaInterpreter.callInput(this,"RIGHT");
            entry.phase = 2;
            break;
        case 2 :
            console.log("right : " + entry.callResult);
            if ( entry.op == "EQUALS" ) {
                entry.returnValue = ( entry.left === entry.callResult );
            } else if ( entry.op == "INEQUAL" ) {
                entry.returnValue = ( entry.left !== entry.callResult );                
            } else if ( entry.op == "LESS" ) {
                entry.returnValue = ( entry.left < entry.callResult );                
            } else if ( entry.op == "LESSEQ" ) {
                entry.returnValue = ( entry.left <= entry.callResult );                
            } else if ( entry.op == "GREATER" ) {
                entry.returnValue = ( entry.left > entry.callResult );                
            } else if ( entry.op == "GREATEREQ" ) {
                entry.returnValue = ( entry.left >= entry.callResult );                
            }
            entry.finished();
            break;
        default:
            entry.finished();
    }
};




AbbozzaInterpreter.exec["func_call"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            // Get name and check for parameters
            entry.par = [];
            entry.name = this.getFieldValue("NAME");
            entry.symbol = Abbozza.getGlobalSymbol(entry.name);
            if (entry.symbol == null)  {
                entry.fnished();
            }
            entry.funcBlock = Abbozza.getTopBlock(entry.name);
            if (entry.funcBlock == null)  {
                entry.finished();
            }
            entry.parameters = entry.funcBlock.symbols.getParameters(true);
            
            if ( this.getInput("PAR0") != null ) {
                entry.no = 0;
                AbbozzaInterpreter.callInput(this,"PAR0",entry.parameters[entry.no][1]);
                entry.phase = 1;
            } else {
                entry.par = null;
                entry.phase = 2;
            }
            break;
        case 1 :
            // Collect parameters
            entry.par.push(entry.callResult);
            entry.no++;
            if ( this.getInput("PAR" + entry.no ) != null ) {
                AbbozzaInterpreter.callInput(this,"PAR" + entry.no,entry.parameters[entry.no][1]);
            } else {
                entry.phase = 2;
            }
            break;
        case 2 : 
            // Call function
            AbbozzaInterpreter.callFunction(entry.funcBlock,entry.par);
            entry.phase = 3;
            break;
        case 3 :
            entry.returnValue = entry.callResult;
            entry.finished();
    }
};



AbbozzaInterpreter.exec["func_decl"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            // Prepare local symbols
            AbbozzaInterpreter.pushLocalSymbols();
            var variables = this.symbols.getVariables(true);
            for (var i = 0; i < variables.length; i++) {
                var variable = variables[i];
                AbbozzaInterpreter.setLocalSymbol(variable[0],AbbozzaInterpreter.getDefaultValue(variable[1],variable[2]));
            }
            
            console.log(entry.args);

            var parameters = this.symbols.getParameters(true);
            for (var i = 0; i < parameters.length; i++) {
                var parameter = parameters[i];
                AbbozzaInterpreter.setLocalSymbol(parameter[0],entry.args[i]);
            }
            
            console.log(AbbozzaInterpreter.localSymbols[AbbozzaInterpreter.localSymbols.length-1]);
            
            if ( AbbozzaInterpreter.callStatement(this,"STATEMENTS") ) {
                entry.phase = 1;
            } else {
                console.log("poping local symbols");
                AbbozzaInterpreter.popLocalSymbols();                
                entry.finished();
            }
            
            break;
        case 1 :
            // Finished since end of statements was reached
            AbbozzaInterpreter.callInput(this,"RETURN",this.rettype);
            entry.phase = 2;
            break;
        case 2 :
            entry.returnValue = entry.callResult;
            console.log("poping local symbols");
            AbbozzaInterpreter.popLocalSymbols();
            entry.finished();
            break;        
        default:
            entry.finished();
    }
};


AbbozzaInterpreter.exec["func_return"] = function(entry) {
    switch ( entry.phase ) {
        case 0 :
            AbbozzaInterpreter.callInput(this,"VALUE");
            entry.phase = 1;
            break;
        case 1 :
            entry.returnValue = entry.callResult;
            // Now we have to pop the execution stack until the next func_decl is found
            AbbozzaInterpreter.endFunctionCall(entry);
            entry.phase = 1;
            break;
        default :
            entry.finished();
    }
}
