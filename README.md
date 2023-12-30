# ------------------------------------------------------------------------------
#                                     CHALLENGE
# ------------------------------------------------------------------------------

# Establecer un servicio web en NodeJS que permita a usuarios escribir mediante una API call
# (post) sobre un archivo de texto compartido de tal manera que cada entrada (línea) está
# "linkeada" a la anterior mediante la utilización de su _hash_ como input y una prueba de
# computo asociada.
# Expected OutPut CSV (file on server):
# `prev_hash,message,nonce`
# donde:
# - *prev_hash*: hash (sha256) en hexa de la línea anterior sin separadores (random
# para linea 0)
# - *message*: mensaje enviado por el usuario
# - *nonce*: número cualquiera tal que garantiza que `sha256(pre_hash + message
# + nonce) => RegEx('^00.*')`, o sea que el hash de esta línea empiece con "dos
# ceros"

# Ejemplo del contenido del file:
# `0000000000000000000000000000000000000000000000000000000000000000,Hola Mundo,5
#  0038711c83bd05b1e369e27246df4ba815a6dda04116b1b2f9a8c21ba4e1de38,Chau Mundo,71`

# Donde se verifica que:
# `crypto.createHash('sha256').update('0038711c83bd05b1e369e27246df4ba815a6d
# da04116b1b2f9a8c21ba4e1de38,Chau Mundo,71', 'utf8').digest('hex').toString()`
# es `00232c7d3c2283695a4029eddc1b9e8c83914515832a04f57b402fc444aa11b5` y
# cumple con la condicion de dos ceros iniciales.

# CRITERIO DE ÉXITO _
# - La solución tiene que ser publicada en github y su README debe poder ser didáctico
# en como instalarlo/ejecutarlo
# - Se pueden hacer request de escritura (API calls) "simultáneos", la escritura en el
# archivo no necesariamente debe respetar el orden de llegada de las requests.
# - El archivo:
# 1. Nunca pierde el linkeo entre líneas (debe verificar que para todo n: `hash(line(n-1))
# == line(n)[0])`
# 2. Todos las líneas cumplen la condición de que su hash empieza con dos ceros

# DESEABLES _
# - Tener tests de integración
# - Tener logs (aunque sea de consola) que indiquen lo que está pasando
# - Que un request no bloquee el archivo, sino que los request "compitan" por escribir en
# mismo según computan la Prueba de Computo
# - Commits atómicos y descripciones claras del flujo de trabajo y avance
# - Code Styling

# CONTEXTO Y ACLARACIONES EXTRAS _
# - Prueba de cómputo: también llamada prueba de trabajo, es una prueba criptográfica
# que se aprovecha de la aleatoriedad de las funciones de hash para exigir pruebas de
# que cierto problema necesito trabajo (fuerza bruta) para encontrar una solución. En
# nuestro caso, encontrar un nonce que nos da dos ceros. Son difíciles de producir, pero
# fáciles de verificar.
# - La propiedad emergente de este tipo de linkeo por hash, es que alterar una entrada
# "histórica", implica re-calcular todos los nuevos "nonces", o sea re-generar todo el
# cómputo histórico acumulado. Fomentando la inmutabilidad del documento.


# ------------------------------------------------------------------------------
#                                   SOLUTION
# ------------------------------------------------------------------------------

# Because of their concurrent non blocking success criteria, the choosen solution pretends to orquest     # concurrent writes over the same file implementing a concurrent queue model.

# Even though it´s possible to resolve the issue using lock techniques, this perspective lacks in         # unnecesary time for each concurrent request waiting to release the resource and then, get the last      # inserted line, calculate prev_hash, generate nonce, write new line. 
# In an hypotetical context in which a huge amount of client´s make requests (for write line service, in   # the same file, and simultaneously) the waiting time will be enormus. 

# The choosen solution has two stages:
# -----------------------------------
# First stage: 
# NodeJS service for Inserting into MongoDB colleciton, just the Message with a TimeStamp and             # CryptoRandomKey signature. This "ensure" ordered unique message identification.                         # CryptoRandomKey increases the difficulty over more than one request with the same TimeStamp (exceptional # cases).

# Second stage: 
# Separated NodeJS service for process syncronization of DB and phisical file.

# Client Interaction:
# Within a GUI, clients can view the file content. The can write a message and added to the shared file.
# If the file has been edited by other client after the file has shown to the GUI, it will be informed via #  status notifications prior to dispatch  the current action. So it doesn´t stop the write operation but  #  let the client to be informed that his message will have a prev_hash asociated to an unknown line until #  the moment.
# If not, the action will be triggered immediately without previous notification.
# Aditional the GUI has other actions. The actions are Checkintegrity, Recalculate Nonces, Edit and Delete.
#  Check Integrity, tests all the file in order to check hash/prev_hash correlation and correct format.
#  Edit, allows to make modificatioins to a message in order to break nonce integrity.
#  Delete, allows to delete entry in order to break prev_hash/hash integrity.
#  Recalculate Nonces, could be used after Check Integrity Failure to regerenate a new valid message chain.


#  --------
# |Thread 1|------
#  --------       |
#  --------       |
# |Thread 2|------|
#  --------       |           ----------------            ------------------------
#  --------       |----------|Concurrent Queue|----------|Queue Reader/File Writer|
# |Thread 3|------|           ----------------            ------------------------ 
#  --------       |                                                   |
#  --------       |                                                   |     
# |Thread N|------|                                              -----------
#  --------                                                     |Output File|  
#                                                                -----------  


# ------------------------------------------------------------------------------
#                                   INSTALLATION
# ------------------------------------------------------------------------------

# Prerequisites:
# -------------
# Windows 64-bit (7+)
# Node ~12.14.1 https://nodejs.org/ (includes NPM)
# MongoDB https://www.mongodb.com/download-center/community

# Steps:
# -------------
# 1. Download the code from GITHub repository. (Clone or Download Button)
#     Make sure you have installed NPM & Node at this point
# 2. Using Terminal/VSCode, go to root folder and type npm install
#     e.g., C:\Users\juanma\code\atix-labs\EJERCICIO-_-NODE\ 
# 3. Type npm install
#     Make sure you have installed MongoDB at this point.
# 3. Type npm start
#     You will see the following:

# Server running at http://localhost:3456/
# Db Connected. 


# ------------------------------------------------------------------------------
#                                   RUNNING APPLICATION
# ------------------------------------------------------------------------------

# Use Case 'View Current File Snapshot':
#  Open browser in http://localhost:3456 and you will see at the bottom of the page a data grid showing    #  prev_hash/hash/nonce, message and actions (delete,edit) by entry.

# Use Case 'Add Message':
#  Open browser in http://localhost:3456 and you will see at the top of the page a text area for input a #  new message. There are 3 possible scenarios: 
#   1. Add button pressed with no message. Fires error message 'Empty Message. Insert Message to add      #   new line'. Stops the action.
#   2. Add button pressed within the message, anyone else add new line first. Send Request. Add entry.    #   Reload the page without showing message.
#   3. Add button pressed with message, but other request add entry first. Fires a Warning message.        #   Send Request. Add entry. Reload the page without showing message.

# Use Case 'Edit Message':
#  Open browser in http://localhost:3456 and you will see a data grid showing prev_hash/hash/nonce,       #  message and actions (delete,edit) by entry. This action only can be requested if exists at least one    #  entry in the grid. With entries in the grid, choose one line and click Edit. A modal window will apear. #  After that you will see inside the modal a text area with the current message. There are 3 possible    #  scenarios:
#   1. Edit to an empty message and save. Closes modal. Fires error message 'Empty Message. Insert Message #   to to apply changes'. Stops the action.
#   2. Edit button pressed within the message, Send Request. Edit entry. Reload the page without          #   showing message but showing the entry with the new message. At this point the chain integrity was     #   broken due to nonce / message concistency.
#   3. Close button or X button, Closes modal. No changes are commited.

# Use Case 'Delete Message':
#  Open browser in http://localhost:3456 and you will see a data grid showing prev_hash/hash/nonce,       #  message and actions (delete,edit) by entry. This action only can be requested if exists at least one    #  entry in the grid. With entries in the grid, choose one line and click Delete. Reload the page without #  showing message and without showing the deleted entry. At this point the chain integrity was broken due #  to prev_hash / hash concistency.

# Use Case 'Check Integrity':
#  Open browser in http://localhost:3456 and you will see a data grid showing prev_hash/hash/nonce,       #  message and actions (delete,edit) by entry. Click Check Integrity Button.
#   With no entries in the grid, you will see the error message 'No Entries to evaluate.'.
#   With entries in the grid there are two possible scenarios, with error and with success.
#    1.Error message, possible messages are:
#     'Integrity check: Failure. prev_hash not sha256'
#     'Integrity check: Failure. hash not sha256'
#     'Integrity check: Failure. nonce not numeric'
#     'Integrity check: Failure. Message doesn´t correspond to Nonce. Message was changed without         #       'Recalculate Nonces' or Nonce was editted'
#     'Integrity check: Failure. prev_hash differs from expected prev_hash.'
#    2.Success message, 'Integrity check: Success.'

# Use Case 'Recalculate Nonces':
#  Open browser in http://localhost:3456 and you will see a data grid showing prev_hash/hash/nonce,       #  message and actions (delete,edit) by entry. Click Recalculate Nonces Button.
#   With no entries in the grid, you will see the error message 'No Entries to evaluate.'.
#   With entries in the grid there are two possible scenarios, both with success.
#    1.Success message, possible messages are:
#     'Regenerate Nonces: Success.'
#     'Check Integrity: Successful. No need to Regenerate Nonces.'


# ------------------------------------------------------------------------------
#                                         NOTES
# -----------------------------------------------------------------------------

# How efficient could Node.js be, in order to manage multiple updates over the same file and (if necessary), spread # those changes over the network?

# Since the server is listening for incoming TCP connections (open a http connection means open a connection on its # underlying transport layer, therefore TCP) on a single socket in a single process, there cannot be two incoming # # connections at exactly the same time. One will be processed by the underlying operating system slightly before the # other one. Think of it this way. An incoming connection is a set of packets over a network connection. One of the # incoming connections will have its packets before the other one.

# This is valid even if you had multiple network cards and multiple network links so two incoming connections could # literally arrive at the server at the exact same moment. Because node.js JS execution is single threaded, the code # processing that request will run its synchronous code to completion. The one that is processed by the OS first    # will be put into the node.js event queue before the other one. When node.js is available to process the next item # in the event queue, then whichever incoming request was first in the event queue will start processing first.

# So, to reach the challenge goal I would prefer C++ language in order to manage multithread requests.

# Pending Tasks:
# -------------
# 1. Shrink node_modules

