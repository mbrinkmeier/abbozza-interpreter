package de.uos.inf.did.abbozza.worlds.handler;


import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.handler.AbstractHandler;
import java.awt.Component;
import java.awt.HeadlessException;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileNameExtensionFilter;

/*
 * Copyright 2018 mbrin.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 * @author mbrin
 */
public class SaveSourceHandler extends AbstractHandler {

    private URL lastSource;
    
    public SaveSourceHandler(AbbozzaServer abbozza) {
        super(abbozza);
        lastSource = null;
    }
    
    
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        String path;
        String contentLocation;
        URL url = null;
        
        try {
            // Check if a query is given
            path = exchg.getRequestURI().getQuery();
            if ( path != null ) {
                url = _abbozzaServer.expandSketchURL(path);
                if ( (url == null) || (!"file".equals(url.getProtocol())) ) {
                    url = null;
                }
            }
            
            contentLocation = saveSources(exchg.getRequestBody(), url);
            if ( contentLocation != null) {
               exchg.getResponseHeaders().add("Content-Location", contentLocation);
               this.sendResponse(exchg, 200, "text/xml", "saved");
            } else {
                this.sendResponse(exchg, 400, "", "");                
            }
        } catch (IOException ioe) {
            this.sendResponse(exchg, 404, "", "");
        }
    }
       
    
    public String saveSources(InputStream stream, URL url) throws IOException {
        if ( _abbozzaServer.isDialogOpen() ) return null;
        
        String location = null;
        
        try {
            // Generate JFileChooser
            File lastSourceFile;
            try {
                lastSourceFile = new File(lastSource.toURI());
            } catch (Exception e) {
                lastSourceFile = null;
            }
            String path = ((lastSourceFile != null) ? lastSourceFile.getAbsolutePath() : _abbozzaServer.getSketchbookPath());
            if ( lastSourceFile == null ) {
                lastSourceFile = new File(path);
            }
                        
            _abbozzaServer.bringFrameToFront();
            _abbozzaServer.setDialogOpen(true);
           
            JFileChooser chooser = new JFileChooser(path) {
                @Override
                protected JDialog createDialog(Component parent)
                        throws HeadlessException {
                    JDialog dialog = super.createDialog(parent);
                    dialog.setLocationByPlatform(true);
                    dialog.setAlwaysOnTop(true);
                    return dialog;
                }
            };

            // Prepare File filters
            chooser.setFileFilter(new FileNameExtensionFilter("abbozza! script(*.abs)", "abs", "ABS"));
            if ( url != null ) {
                chooser.setSelectedFile(new File(url.toURI()));
            } else {
                if ( lastSourceFile.isDirectory() ) {
                    chooser.setCurrentDirectory(lastSourceFile);
                } else {
                    chooser.setSelectedFile(lastSourceFile);
                }
            }

            // Show FileChooser
            if (chooser.showSaveDialog(null) == JFileChooser.APPROVE_OPTION) {
                File file = chooser.getSelectedFile();
                if (!file.getName().endsWith(".abs") && !file.getName().endsWith(".ABS")) {
                    file = new File(file.getPath() + ".abs");
                }
                FileWriter writer;

                if (!file.equals(lastSourceFile) && file.exists()) {
                    int answer = JOptionPane.showConfirmDialog(null, AbbozzaLocale.entry("msg.file_overwrite", file.getName()), "", JOptionPane.YES_NO_OPTION);
                    if ( (answer != JOptionPane.YES_OPTION) && (answer != JOptionPane.OK_OPTION) ) {
                        _abbozzaServer.setDialogOpen(false);
                        _abbozzaServer.resetFrame();        
                        _abbozzaServer.toolIconify();
                        return null;
                    }
                }

                // Prepare output writer
                writer = new FileWriter(file);
                try (InputStreamReader reader = new InputStreamReader(stream)) {
                    char buf[] = new char[1024];
                    while ( reader.ready() ) {
                        int len = reader.read(buf);
                        writer.write(buf, 0, len);
                    }
                    writer.write(stream.read());
                    
                    writer.close();
                }
                lastSource = file.toURI().toURL();
                location = file.toURI().toURL().toString();
            }
        } catch (HeadlessException | IOException | URISyntaxException ex) {
            AbbozzaLogger.err(ex.toString());
            ex.printStackTrace(System.err);
        }
        _abbozzaServer.setDialogOpen(false);
        _abbozzaServer.resetFrame();        
        _abbozzaServer.toolIconify();
        
        return location;
    }
}
