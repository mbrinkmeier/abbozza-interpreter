/**
 * @license abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
/**
 * @fileoverview ... @author michael.brinkmeier@uni-osnabrueck.de (Michael
 * Brinkmeier)
 */
package de.uos.inf.did.abbozza.worlds.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.handler.AbstractHandler;
import java.awt.Component;
import java.awt.HeadlessException;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.filechooser.FileNameExtensionFilter;

/**
 *
 * @author mbrinkmeier
 */
public class LoadSourceHandler extends AbstractHandler {

    private String contentLocation;

    /**
     *
     * @param abbozza The AbbozzaServer.
     */
    public LoadSourceHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    /**
     *
     * @param exchg The HTTPExchange Object representing the request.
     * @throws IOException Thrown if an IO Error occured during request handling
     */
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        contentLocation = null;
        try {
            String query = exchg.getRequestURI().getQuery();
            String sketch = loadSources();
            if (sketch != null) {
                if (contentLocation != null) {
                    exchg.getResponseHeaders().add("Content-Location", contentLocation);
                }
                this.sendResponse(exchg, 200, "text/javascript; charset=utf-8", sketch);
            } else {
                this.sendResponse(exchg, 404, "", "");
            }
        } catch (IOException ioe) {
            ioe.printStackTrace(System.out);
            this.sendResponse(exchg, 404, "", "");
        }
    }

    /**
     * Load sketch chosen by user.
     *
     * @return The loaded sketch as a string.
     * @throws IOException thrown if an IO error occured.
     */
    public String loadSources() throws IOException {
        if (_abbozzaServer.isDialogOpen()) {
            return null;
        }

        String result = "";
        File lastSketchFile = null;
        URL last = _abbozzaServer.getLastSketchFile();
        if (last == null) {
            lastSketchFile = new File(".");
        } else {
            try {
                lastSketchFile = new File(last.toURI());
            } catch (Exception ex) {
                lastSketchFile = new File(".");
            }
        }
        AbbozzaLogger.out("LoadHandler: last sketch " + lastSketchFile.getCanonicalPath(), AbbozzaLogger.DEBUG);
        
        String path = ((lastSketchFile != null) ? lastSketchFile.getCanonicalPath() : _abbozzaServer.getSketchbookPath());
        JFileChooser chooser = new JFileChooser(path) {
            protected JDialog createDialog(Component parent) throws HeadlessException {
                JDialog dialog = super.createDialog(parent);
                dialog.setLocationByPlatform(true);
                dialog.setAlwaysOnTop(true);
                return dialog;
            }
        };

        chooser.setFileFilter(new FileNameExtensionFilter("abbozza! script (*.abs)", "abs", "ABS"));
        if (lastSketchFile.isDirectory()) {
            chooser.setCurrentDirectory(lastSketchFile);
        } else {
            chooser.setSelectedFile(lastSketchFile);
        }

        _abbozzaServer.bringFrameToFront();
        _abbozzaServer.setDialogOpen(true);

        int choice = chooser.showOpenDialog(null);
        if (choice == JFileChooser.APPROVE_OPTION) {
            URL url;
            File file = chooser.getSelectedFile();
            url = file.toURI().toURL();

            if (url.toString().endsWith("abs")) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream(), "utf-8"));
                while (reader.ready()) {
                    result = result + reader.readLine() + '\n';
                }
                reader.close();
            }
        } else {
            _abbozzaServer.setDialogOpen(false);
            _abbozzaServer.resetFrame();
            _abbozzaServer.toolIconify();
            throw new IOException();
        }
        _abbozzaServer.setDialogOpen(false);
        _abbozzaServer.resetFrame();
        _abbozzaServer.toolIconify();
        return result;
    }

}
