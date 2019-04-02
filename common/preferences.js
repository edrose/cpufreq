/*
 * CPUFreq Manager - a lightweight CPU frequency scaling monitor
 * and powerful CPU management tool
 *
 * Author (C) 2016-2018 konkor <kapa76@gmail.com>
 *
 * This file is part of CPUFreq Manager.
 *
 * CPUFreq Manager is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CPUFreq Manager is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;

const APPDIR = get_appdir ();
imports.searchPath.unshift(APPDIR);
const Prefs = imports.prefs;

var Preferences = new GObject.registerClass (class Preferences{

    _init () {
        this.application = new Gtk.Application ();
        GLib.set_application_name ("CPUFreq Preferences");
        GLib.set_prgname ("CPUFreq Preferences");
        this.application.connect ('activate', this._onActivate.bind(this));
        this.application.connect ('startup', this._onStartup.bind(this));
    }

    _onActivate (){
        this._window.show_all ();
    }

    _onStartup () {
        this._window = new Gtk.Window ();
        this._window.title = "CPUFreq Preferences";
        this._window.set_icon_name ('io.konkor.cpufreq');
        if (!this._window.icon) try {
            this._window.icon = Gtk.Image.new_from_file (APPDIR + "/data/icons/cpufreq.png").pixbuf;
        } catch (e) {
            error (e.message);
        }
        this._window.set_default_size (640, 320);
        Prefs.init ();
        this.w = Prefs.buildPrefsWidget ();
        this._window.add (this.w);
        this.application.add_window (this._window);
    }
});

function getCurrentFile () {
    let stack = (new Error()).stack;
    let stackLine = stack.split('\n')[1];
    if (!stackLine)
        throw new Error ('Could not find current file');
    let match = new RegExp ('@(.+):\\d+').exec(stackLine);
    if (!match)
        throw new Error ('Could not find current file');
    let path = match[1];
    let file = Gio.File.new_for_path (path).get_parent();
    return [file.get_path(), file.get_parent().get_path(), file.get_basename()];
}

function get_appdir () {
    let s = getCurrentFile ()[1];
    if (GLib.file_test (s + "/prefs.js", GLib.FileTest.EXISTS)) return s;
    s = GLib.get_home_dir () + "/.local/share/gnome-shell/extensions/cpufreq@konkor";
    if (GLib.file_test (s + "/prefs.js", GLib.FileTest.EXISTS)) return s;
    s = "/usr/local/share/gnome-shell/extensions/cpufreq@konkor";
    if (GLib.file_test (s + "/prefs.js", GLib.FileTest.EXISTS)) return s;
    s = "/usr/share/gnome-shell/extensions/cpufreq@konkor";
    if (GLib.file_test (s + "/prefs.js", GLib.FileTest.EXISTS)) return s;
    throw "CPUFreq installation not found...";
    return s;
}

let app = new Preferences ();
app.application.run (ARGV);
