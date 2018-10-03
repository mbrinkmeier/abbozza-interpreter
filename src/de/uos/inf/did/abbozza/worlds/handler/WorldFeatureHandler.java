/**
 * @license
 * abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview ...
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

package de.uos.inf.did.abbozza.worlds.handler;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.handler.AbstractHandler;
import de.uos.inf.did.abbozza.worlds.AbbozzaWorlds;
import de.uos.inf.did.abbozza.worlds.World;
import de.uos.inf.did.abbozza.tools.XMLTool;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;

/**
 *
 * @author michael
 */
public class WorldFeatureHandler extends AbstractHandler {

    public WorldFeatureHandler(AbbozzaWorlds abbozza) {
        super(abbozza);
    }

    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        World context = ((AbbozzaWorlds) _abbozzaServer).getWorld();
        sendResponse(exchg, 200, "text/xml", XMLTool.documentToString(getFeatures(exchg.getRequestURI().getPath())));
    }

    
    
    private Document getFeatures(String path) {
        // Read the xml file for the global feature
        Document featureXml = null;

       String prefix = "/abbozza/features/";        
        World world = null;
        String worldId = null;
        int len = prefix.length();

        // Extract world id from path
        int start = path.indexOf(prefix);
        if ( start >= 0 ) {
            start = start + len;
            int end = path.indexOf("/",start);
            worldId = path.substring(start,end);
            world = ((AbbozzaWorlds) this._abbozzaServer).getWorld(worldId);
            path = path.substring(end+1);
        }
        if ( world == null) {
            world = ((AbbozzaWorlds) this._abbozzaServer).getWorld("console");
            path = null;
        }

        featureXml = world.getFeatures();
  
        AbbozzaServer.getPluginManager().mergeFeatures(featureXml);

       
        // Get the world id from the path
        
        return featureXml;
    }
}
