<<<<<<< OURS
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
package de.uos.inf.did.abbozza.worlds.monitor;

import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;
import de.uos.inf.did.abbozza.monitor.MonitorPanel;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksBytes;
import javax.swing.JPopupMenu;

/**
 *
 * @author mbrinkmeier
 */
public class WorldsPanel extends MonitorPanel {       
    /**
     * Creates new form OszillosgraphMonitor
     */
    public WorldsPanel() {}
    
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        _popup = new javax.swing.JPopupMenu();
        resetItem = new javax.swing.JMenuItem();
        resetScaleItem = new javax.swing.JMenuItem();
        jScrollPane1 = new javax.swing.JScrollPane();
        messagePane = new javax.swing.JTextPane();

        resetItem.setText(AbbozzaLocale.entry("gui.reset_osci")
        );
        resetItem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                resetItemActionPerformed(evt);
            }
        });
        _popup.add(resetItem);

        resetScaleItem.setText(AbbozzaLocale.entry("gui.reset_osci_scale"));
        resetScaleItem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                resetScaleItemActionPerformed(evt);
            }
        });
        _popup.add(resetScaleItem);

        jScrollPane1.setViewportView(messagePane);

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addComponent(jScrollPane1, javax.swing.GroupLayout.DEFAULT_SIZE, 400, Short.MAX_VALUE)
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addComponent(jScrollPane1, javax.swing.GroupLayout.DEFAULT_SIZE, 242, Short.MAX_VALUE)
        );
    }// </editor-fold>//GEN-END:initComponents

    private void resetItemActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_resetItemActionPerformed
        
    }//GEN-LAST:event_resetItemActionPerformed

    private void resetScaleItemActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_resetScaleItemActionPerformed
        
    }//GEN-LAST:event_resetScaleItemActionPerformed


    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JPopupMenu _popup;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JTextPane messagePane;
    private javax.swing.JMenuItem resetItem;
    private javax.swing.JMenuItem resetScaleItem;
    // End of variables declaration//GEN-END:variables

    @Override
    public JPopupMenu getPopUp() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void processMessage(String msg) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void process(ClacksBytes bytes) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void connect(AbbozzaMonitor monitor) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void disconnect(AbbozzaMonitor monitor) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
=======
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
package de.uos.inf.did.abbozza.worlds.monitor;

import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;
import de.uos.inf.did.abbozza.monitor.MonitorPanel;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksBytes;
import javax.swing.JPopupMenu;

/**
 *
 * @author mbrin
 */
public class WorldsPanel extends MonitorPanel {

    @Override
    public JPopupMenu getPopUp() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void processMessage(String msg) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void process(ClacksBytes bytes) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void connect(AbbozzaMonitor monitor) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void disconnect(AbbozzaMonitor monitor) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
>>>>>>> THEIRS
}
