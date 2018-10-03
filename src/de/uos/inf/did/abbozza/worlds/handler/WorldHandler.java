
package de.uos.inf.did.abbozza.worlds.handler;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.handler.AbstractHandler;
import de.uos.inf.did.abbozza.worlds.AbbozzaWorlds;
import de.uos.inf.did.abbozza.worlds.World;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 *
 * @author michael
 */


public class WorldHandler extends AbstractHandler {

    private AbbozzaWorlds abbozza;
    private String prefix;
    
    
    public WorldHandler(AbbozzaWorlds abbozza, String prefix) {
        this.abbozza = abbozza;
        this.prefix = prefix;
    }
    
    
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        World world = null;
        String worldId = null;

        int len = prefix.length();
        String path = exchg.getRequestURI().getPath(); 

        // Extract world id from path
        int start = path.indexOf(prefix);
        if ( start >= 0 ) {
            start = start + len;
            int end = path.indexOf("/",start);
            worldId = path.substring(start,end);
            world = abbozza.getWorld(worldId);
            path = path.substring(end+1);
        }
        if ( world == null) {
            world = abbozza.getWorld("console");
            path = null;
        }
        
        InputStream is = null;

        if (( path == null ) || ( path.equals("")) || (path.equals("worlds.html")) ) {
            is = abbozza.getJarHandler().getInputStream("/worlds.html");
        } else {
            is = world.getStream(path);
            if ( is == null ) {
                is = abbozza.getJarHandler().getInputStream(path);
            }
        }
        
        OutputStream os = exchg.getResponseBody();
        if (is != null) {
            exchg.sendResponseHeaders(200,0);
            while ( is.available() > 0 ) {
                os.write(is.read());
            }
            os.flush();
            is.close();
            os.close();
        } else {
            String result = path + " not found";
            exchg.sendResponseHeaders(400,result.length());            
            os.write(result.getBytes());
            os.close();            
        }
    }
    
} 
