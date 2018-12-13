/**
 * @license abbozza!
 *
 * Copyright 2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package de.uos.inf.did.abbozza.worlds;

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author michael
 */

public class World {

    private String basePath;
    private URL baseURL;
    private String id;
    private String displayName;
    private String description;
    private Node options;
    private String infoPane;
    
    /**
     * Insert a world without id at a given path
     * 
     * @param path 
     */
    public World(String path) {
        basePath = path;
        baseURL = null;
        readXML();
    }
    
    
    public World(String id, String displayName, String path) {
        basePath = path;
        baseURL = null;
        this.id = id;
        this.displayName = displayName;
    }
    
    public World(String id, URL url) {
        basePath = null;
        baseURL = url;
        this.id = id;
    }
    
    /**
     * Get a file from the world directory as InputStream
     * 
     * @param path The path of the file, relative to the world directory.
     * 
     * @return The Input Stream of the file
     */
    public InputStream getStream(String path) {   
        InputStream is;
        if ( basePath == null ) {
            URL url;
            try {
                url = new URL(baseURL,path);
                is = url.openStream();
            } catch (MalformedURLException ex) {
                is = null;
            } catch (IOException ex2) {
                is = null;
            }
        } else {
            if ( path == null ) {
                is = AbbozzaServer.getInstance().getJarHandler().getInputStream(basePath + "/world.xml");
            } else {
                is = AbbozzaServer.getInstance().getJarHandler().getInputStream(basePath + "/" + path);
            }            
        }
        return is;
    }
    
    /**
     * Get the id of then world.
     * 
     * @return 
     */
    public String getId() {
        return id;
    }
    
    /**
     * Get the display name of the world.
     * 
     * @return 
     */
    public String toString() {
        return displayName;
    }
    
    /**
     * Read the world from the file world.xml in the world directory.
     */
    private void readXML() {
        InputStream is = this.getStream(null);
        Document contextXml = null;

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            contextXml = builder.parse(is);
        } catch (ParserConfigurationException | SAXException ex) {
            contextXml = null;
            AbbozzaLogger.err("World: Could not parse " + basePath + "/world.xml");
        } catch (IOException ex) {
            contextXml = null;
            AbbozzaLogger.err("World: Could not find " + basePath + "/world.xml");
        }
        
        NodeList contexts = contextXml.getElementsByTagName("world");
        if ( contexts.getLength() > 0) {
            // Only get the first context
            Node contextNode = contexts.item(0);
            this.id = contextNode.getAttributes().getNamedItem("id").getNodeValue();
            NodeList children = contextNode.getChildNodes();
            Node child;
            for (int idx = 0; idx < children.getLength(); idx++ ) {
                child = children.item(idx);
                String name = child.getNodeName();
                
                if ( name.equals("name") ) {
                    displayName = child.getTextContent().trim();
                } else if ( name.equals("description") ) {
                    description = child.getTextContent().trim();
                } else if ( name.equals("options") ) {
                   options = child; 
                }
            }            
        }
        
        AbbozzaLogger.info("Context: Found world " + this.id + " at path " + this.basePath);
        
    }

    public String getDescription() {
        return description;
    }
    
    
    public Node getOptions() {
        return options;
    }
    
     
    public Document getFeatures() {
        Document featureXml = null;
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        
        try {
            InputStream stream = this.getStream("features.xml");
            builder = factory.newDocumentBuilder();
            StringBuilder xmlStringBuilder = new StringBuilder();
            featureXml = builder.parse(stream);
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
        }

        return featureXml;
    }
}
