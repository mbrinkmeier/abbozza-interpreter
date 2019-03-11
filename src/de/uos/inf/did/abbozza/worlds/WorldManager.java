
package de.uos.inf.did.abbozza.worlds;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.swing.ComboBoxModel;
import javax.swing.event.ListDataListener;

/**
 *
 * @author michael
 */


public class WorldManager implements ComboBoxModel<World> {
    
    private AbbozzaWorlds abbozza;
    private ArrayList<World> worlds;
    private World selectedWorld;
    private ArrayList<ListDataListener> listeners;
    
    public WorldManager(AbbozzaWorlds abbozza) {
        this.abbozza = abbozza;
        worlds = new ArrayList<>();
        listeners = new ArrayList<>();
    }
    
    
    public void registerWorld(World context) {
        worlds.add(context);
    }
    
    
    public void setSelectedItem(Object selected) {
        selectedWorld = (World) selected;
    }

    @Override
    public Object getSelectedItem() {
        return selectedWorld;
    }

    @Override
    public int getSize() {
        return worlds.size();
    }

    @Override
    public World getElementAt(int index) {
        return worlds.get(index);
    }

    @Override
    public void addListDataListener(ListDataListener l) {
        if ( !listeners.contains(l) ) listeners.add(l);
    }

    @Override
    public void removeListDataListener(ListDataListener l) {
        listeners.remove(l);
    }

    public World getWorld(String id) {
        if ( id == null ) {
            if ( this.selectedWorld != null ) {
                return this.selectedWorld;
            } else {
                return this.getElementAt(0);
            }
        }
        for ( World context : worlds ) {
            if ( context.getId().equals(id) ) {
                return context;
            }
        }
        return this.selectedWorld;
    }
    
    public List<World> getWorlds() {
        return worlds;
    }
}
