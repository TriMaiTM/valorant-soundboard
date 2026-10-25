# Valorant Soundboard (Portable & PWA)

A customizable soundboard for Valorant and other online games. It mixes your real microphone with sound effects, supports global NumPad hotkeys in-game, and can be controlled remotely from your phone (PWA).

---

## Features

- **Echo-free audio mixer:** Mixes your real mic and SFX into the virtual audio path (`VB-CABLE Input`) so your teammates hear both, while sending the effects back to your headphones without looping your own mic voice.
- **Global NumPad hotkeys:** Automatically binds `NumPad 1` to `NumPad 9` to your sounds and `NumPad 0` to **stop all sounds**, right in the middle of a Valorant match, with no Alt-Tab and no need to pick up your phone.
- **Easy SFX management:** The "Open Sounds Folder" button opens the folder in Windows. Drag, drop, add, or delete `.mp3`, `.wav`, and `.ogg` files, and the app reloads them in real time.
- **Phone PWA controller:** Scan a QR code to open the control interface instantly, with haptic feedback, sound search, and the option to install it on your home screen without the Safari/Chrome address bar.
- **Internet cafe mode (Cloudflare Quick Tunnel):** When you are on a different network (or your phone is on 4G), one button gives you a secure link and QR code that connects through the cafe's firewall.
- **One-click portable build:** Packaged as a single file, `Valorant-Soundboard-Portable.exe`. Double-click to run, with no installation and no Administrator rights required.

---

## Setup and Audio Configuration

### 1. Preparation

Download and install the free virtual audio driver: [VB-Audio CABLE](https://vb-audio.com/Cable/) (takes about 30 seconds).

### 2. Configure the Soundboard app

- **Real Microphone:** Select the physical microphone you are using.
- **Output:** Select `CABLE Input (VB-Audio Virtual Cable)`.
- **Monitor:** Select your physical headphones.
- Click **START SOUNDBOARD**.

### 3. Configure Valorant (Settings > Audio > Voice Chat)

- **Input Device:** Change to `CABLE Output (VB-Audio Virtual Cable)`.
- **Output Device:** Select your headphones as usual.
- *Note:* If you use **Push-To-Talk (PTT)** in Valorant, hold your PTT key while playing a sound. The app adds a 300 ms delay so you have time to press the key.

---

## Adding or Removing Sounds

1. Click the **Open Sounds Folder** button in the desktop app.
2. Drop audio files (`.mp3`, `.wav`, `.ogg`, `.m4a`) into the folder, or delete the ones you no longer need.
3. The app updates the list automatically and assigns `NumPad 1-9` hotkeys in alphabetical order.
