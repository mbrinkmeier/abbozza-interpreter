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
import de.uos.inf.did.abbozza.plugin.Plugin;
import de.uos.inf.did.abbozza.worlds.AbbozzaWorlds;
import de.uos.inf.did.abbozza.worlds.World;
import de.uos.inf.did.abbozza.tools.XMLTool;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

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
        Document globalFeaturesXml = null;
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        
        String globalPath = "/js/abbozza/" + this._abbozzaServer.getSystem() + "/features.xml";
                
        try {
            AbbozzaLogger.out("FeatureHandler: Loading global features from " + globalPath,AbbozzaLogger.INFO);
            InputStream stream = this._abbozzaServer.getJarHandler().getInputStream(globalPath);
            builder = factory.newDocumentBuilder();
            StringBuilder xmlStringBuilder = new StringBuilder();
            globalFeaturesXml = builder.parse(stream);
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
        }
        System.out.println(XMLTool.documentToString(globalFeaturesXml));        
        // Get th worlds specific features
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
        System.out.println(XMLTool.documentToString(featureXml));        
        
        // Merge featureXml into globalFeaturesXml
        this.mergeFeatures(globalFeaturesXml, featureXml);
        System.out.println(XMLTool.documentToString(globalFeaturesXml));        
        
        // Merge features from plugins
        AbbozzaServer.getPluginManager().mergeFeatures(globalFeaturesXml);

        return globalFeaturesXml;
    }
    
    
    private void mergeFeatures(Document featureXml, Document addXml) {
        NodeList roots = featureXml.getElementsByTagName("features");
        if (roots.getLength() == 0) {
            return;
        }
        Node root = roots.item(0);
        
        NodeList features = addXml.getElementsByTagName("feature");        
        for (int i = 0; i < features.getLength() ; i++ ) {
            Node feature = features.item(i);
            featureXml.adoptNode(feature);
            root.appendChild(feature);
        }        
    }

}


