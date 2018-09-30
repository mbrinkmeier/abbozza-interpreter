package de.uos.inf.did.abbozza.worlds;

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;
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
    
    public String getId() {
        return id;
    }
    
    public String toString() {
        return displayName;
    }
    
    private void readXML() {
        InputStream is = this.getStream(null);
        Document contextXml = null;

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            contextXml = builder.parse(is);
        } catch (ParserConfigurationException ex) {
            contextXml = null;
            AbbozzaLogger.err("World: Could not parse " + basePath + "/world.xml");
        } catch (SAXException ex) {
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
                }
            }            
        }
        
        AbbozzaLogger.info("Context: Found world " + this.id + " at path " + this.basePath);

        
    }

    String getDescription() {
        return description;
    }
}
