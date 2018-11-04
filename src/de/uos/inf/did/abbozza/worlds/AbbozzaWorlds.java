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

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.core.AbbozzaServerException;
import de.uos.inf.did.abbozza.core.AbbozzaSplashScreen;
import de.uos.inf.did.abbozza.handler.JarDirHandler;
import de.uos.inf.did.abbozza.tools.XMLTool;
import de.uos.inf.did.abbozza.worlds.handler.LoadSourceHandler;
import de.uos.inf.did.abbozza.worlds.handler.SaveSourceHandler;
import de.uos.inf.did.abbozza.worlds.handler.WorldFeatureHandler;
import de.uos.inf.did.abbozza.worlds.handler.WorldHandler;
import java.awt.AWTException;
import java.awt.MenuItem;
import java.awt.PopupMenu;
import java.awt.SystemTray;
import java.awt.TrayIcon;
import java.awt.event.ActionEvent;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.ImageIcon;
import javax.swing.JOptionPane;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author michael
 */
public class AbbozzaWorlds extends AbbozzaServer implements HttpHandler {

    public static final int SYS_MAJOR = 0;
    public static final int SYS_MINOR = 1;
    public static final int SYS_REV = 0;
    public static final int SYS_HOTFIX = 0;
    public static final String SYS_REMARK = "(worlds)";
    public static final String SYS_VERSION = SYS_MAJOR + "." + SYS_MINOR + "." + SYS_REV + "." + SYS_HOTFIX + " " + SYS_REMARK;

    protected TrayIcon trayIcon;
    protected String localWorldPath;
    protected String globalWorldPath;
    protected WorldManager worldManager;
    protected World currentWorld;

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        AbbozzaWorlds abbozza = new AbbozzaWorlds();
        abbozza.init("worlds", args);
    }

    /**
     * The general initialization of an calliope abbozza! server.
     *
     * @param system The system id
     * @param args The command line parameters
     */
    public void init(String system, String args[]) {

        AbbozzaSplashScreen.showSplashScreen("de/uos/inf/did/abbozza/worlds/icons/abbozza-worlds-splash.png");

        super.init(system, args);

        worldManager = new WorldManager(this);
        worldManager.registerWorld(new World("worlds/console"));
        worldManager.registerWorld(new World("worlds/kara"));
        worldManager.registerWorld(new World("worlds/turtle"));
        worldManager.registerWorld(new World("worlds/hanoi"));
        this.setWorld(worldManager.getWorld("hanoi"));
        
        // Open Frame
        AbbozzaWorldsFrame frame = new AbbozzaWorldsFrame(this);
        frame.open();
        mainFrame = frame;

        // Try to start server on given port
        int serverPort = config.getServerPort();
        try {
            this.startServer(serverPort);
        } catch (AbbozzaServerException ex) {
            AbbozzaLogger.err(ex.getMessage());

            AbbozzaSplashScreen.hideSplashScreen();

            TimerTask worker = new TimerTask() {
                @Override
                public void run() {
                    System.exit(1);
                }
            };

            Timer timer = new Timer();
            timer.schedule(worker, 5000);

            String msg;
            if (ex.getType() == AbbozzaServerException.SERVER_RUNNING) {
                msg = AbbozzaLocale.entry("msg.already_running");
            } else {
                msg = AbbozzaLocale.entry("msg.port_denied", "" + serverPort);
            }

            JOptionPane.showMessageDialog(null, msg, "abbozza!", JOptionPane.ERROR_MESSAGE);
            System.exit(1);
        }

        startBrowser("abbozza/world/" + currentWorld.getId() + "/");

        try {
            if (SystemTray.isSupported()) {
                AbbozzaLogger.info("Setting system tray icon");
                ImageIcon icon = new ImageIcon(AbbozzaWorlds.class.getResource("/img/abbozza_icon_white.png"));
                PopupMenu trayMenu = new PopupMenu();
                MenuItem item = new MenuItem(AbbozzaLocale.entry("gui.startBrowser"));
                item.addActionListener((ActionEvent e) -> {
                    // startBrowser(system + ".html");
                    startBrowser("abbozza/world/" + currentWorld.getId() + "/");
                    // startBrowser("worlds.html");
                });
                trayMenu.add(item);
                item = new MenuItem(AbbozzaLocale.entry("gui.showFrame"));
                item.addActionListener((ActionEvent e) -> {
                    bringFrameToFront();
                });
                trayMenu.add(item);
                item = new MenuItem(AbbozzaLocale.entry("gui.quit"));
                item.addActionListener((ActionEvent e) -> {
                    quit();
                });
                trayMenu.add(item);
                trayIcon = new TrayIcon(icon.getImage(), "abbozza!", trayMenu);
                trayIcon.setToolTip("abbozza!");
                trayIcon.setImageAutoSize(true);
                SystemTray.getSystemTray().add(trayIcon);
            }
        } catch (AWTException e) {
            AbbozzaLogger.err(e.getLocalizedMessage());
        }

        setWorld(worldManager.getElementAt(0));
        frame.setWorldAt(0);

        AbbozzaSplashScreen.hideSplashScreen();
    }

    /**
     * Initialize the server and use the command line arguments
     *
     * @param system The system id
     */
    public void init(String system) {
        // initialize the server
        init(system, null);
    }

    public WorldManager getWorldManager() {
        return worldManager;
    }

    /**
     * Set additional paths.
     */
    public void setAdditionalPaths() {
        localPluginPath = userPath + "/plugins";
        globalPluginPath = abbozzaPath + "/plugins";
        localWorldPath = userPath + "/worlds";
        globalWorldPath = abbozzaPath + "/worlds";

        AbbozzaLogger.info("jarPath = " + jarPath);
        AbbozzaLogger.info("runtimePath = " + abbozzaPath);
        AbbozzaLogger.info("userPath = " + userPath);
        AbbozzaLogger.info("sketchbookPath = " + sketchbookPath);
        AbbozzaLogger.info("localJarPath = " + localJarPath);
        AbbozzaLogger.info("localPluginPath = " + localPluginPath);
        AbbozzaLogger.info("globalPluginPath = " + globalPluginPath);
        AbbozzaLogger.info("localWorldPath = " + localWorldPath);
        AbbozzaLogger.info("globalWorldPath = " + globalWorldPath);
        AbbozzaLogger.info("browserPath = " + config.getBrowserPath());
    }

    @Override
    public void handle(HttpExchange he) throws IOException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void registerSystemHandlers() {
        httpServer.createContext("/abbozza/savesource", new SaveSourceHandler(this));
        httpServer.createContext("/abbozza/loadsource", new LoadSourceHandler(this));
        httpServer.createContext("/abbozza/features", new WorldFeatureHandler(this));
        httpServer.createContext("/abbozza/world", new WorldHandler(this, "/abbozza/world/"));
    }

    @Override
    public void findJarsAndDirs(JarDirHandler jarHandler) {
        jarHandler.addDir(jarPath + "/", "Dir");
        try {
            jarHandler.addJar(AbbozzaWorlds.class.getProtectionDomain().getCodeSource().getLocation().toURI(),"Jar");
        } catch (URISyntaxException ex) {
            AbbozzaLogger.err("Could not find jar file by class");
            jarHandler.addJar(jarPath + "/abbozza-worlds.jar", "Jar");
        } 
    }

    @Override
    public void toolToBack() {
    }

    @Override
    public void toolSetCode(String code) {
    }

    @Override
    public void toolIconify() {
    }

    @Override
    public int compileCode(String code) {
        return 0;
    }

    @Override
    public int uploadCode(String code) {
        return 0;
    }

    @Override
    public String findBoard() {
        return "";
    }

    @Override
    public File queryPathToBoard(String path) {
        return null;
    }

    @Override
    public boolean installPluginFile(InputStream stream, String name) {
        return false;
    }

    @Override
    public void installUpdate(String version, String updateUrl) {
    }

    private void quit() {
    }

    public TrayIcon getTrayIcon() {
        return trayIcon;
    }

    /**
     * Wherw the options.xml lies
     *
     * @return
     */
    public String getOptionsPath() {
        return "/js/abbozza/worlds/options.xml";
    }

    public String getSystemPath() {
        return "abbozza/world/" + currentWorld.getId() + "/";
    }
    
    /**
     * Construct the original option tree. Then add options for all worlds.
     *
     */
    @Override
    public Document getOptionTree() {
        Document optionXml = super.getOptionTree();
        Node worldOptions;
        
        Node worldNode = null;
        NodeList groupNodes = optionXml.getElementsByTagName("group");
        int idx = 0;
        while ((idx < groupNodes.getLength()) && (worldNode == null)) {
            if (groupNodes.item(idx).getAttributes().getNamedItem("name").getTextContent().equals("gui.worlds")) {
                worldNode = groupNodes.item(idx);
            }
            idx++;
        }

        if ( worldManager == null ) return optionXml;
        
        if (worldNode != null) {
            for (World world : worldManager.getWorlds()) {
                worldOptions = world.getOptions();
                if (worldOptions != null) {
                    Element parent = optionXml.createElement("group");
                    parent.setAttribute("name", world.toString());
                    worldNode.appendChild(parent);
                    NodeList children = worldOptions.getChildNodes();
                    for (idx = 0; idx < children.getLength(); idx++) {
                        Node child = children.item(idx);
                        Node clone = child.cloneNode(true);
                        optionXml.adoptNode(clone);
                        parent.appendChild(clone);
                    }
                }
                // Node newNode = worldOptions.cloneNode(true);
            }
        }

        AbbozzaLogger.err(XMLTool.documentToString(optionXml));

        return optionXml;
    }

    public void setWorld(World world, File file) {
        currentWorld = world;
        AbbozzaLocale.setLocale(this.config.getLocale());
        this.startBrowser("abbozza/world/" + world.getId() + "/worlds.html?" + file.toURI());
    }

    public void setWorld(World world, boolean browser) {
        currentWorld = world;
        AbbozzaLocale.setLocale(this.config.getLocale());
        if (browser) this.startBrowser("abbozza/world/" + world.getId() + "/worlds.html");
        // @TODO
    }

    public void setWorld(World world) {
        currentWorld = world;
        AbbozzaLocale.setLocale(this.config.getLocale());
        // @TODO
    }

    public String getWorldId() {
        return currentWorld.getId();
    }

    public World getWorld() {
        return currentWorld;
    }

    public World getWorld(String id) {
        return worldManager.getWorld(id);
    }

    public String getGlobalWorldPath() {
        return this.globalWorldPath;
    }

    public String getLocalWorldPath() {
        return this.localWorldPath;
    }

    /**
     * Add additonal locale entries.
     *
     * @param locale The locale
     * @param root The Element ot which the entries should be added
     */
    public void addAdditionalLocale(String locale, Element root) {
        if (getWorld() == null) {
            return;
        }

        for (World world : worldManager.getWorlds()) {
            InputStream is = world.getStream(locale + ".xml");
            if (is != null) {

                try {
                    Document locDoc;
                    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder builder = factory.newDocumentBuilder();
                    locDoc = builder.parse(is);

                    Element foundElement = null;
                    NodeList languages = locDoc.getElementsByTagName("language");
                    for (int i = 0; i < languages.getLength(); i++) {
                        Element element = (Element) languages.item(i);
                        if ((foundElement == null) || (locale.equals(element.getAttribute("id")))) {
                            foundElement = element;
                        }
                    }

                    if (foundElement != null) {
                        root.getOwnerDocument().adoptNode(foundElement);
                        root.appendChild(foundElement);     
                    }
                } catch (ParserConfigurationException ex) {
                    Logger.getLogger(AbbozzaWorlds.class.getName()).log(Level.SEVERE, null, ex);
                } catch (SAXException ex) {
                    Logger.getLogger(AbbozzaWorlds.class.getName()).log(Level.SEVERE, null, ex);
                } catch (IOException ex) {
                    Logger.getLogger(AbbozzaWorlds.class.getName()).log(Level.SEVERE, null, ex);
                }

            }
        }
    }

}
