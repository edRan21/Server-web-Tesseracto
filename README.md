# Server-web-Teseracto
![Badge en Desarrollo](https://img.shields.io/badge/STATUS-EN%20DESAROLLO-gren)

>[!NOTE]
>Se migra el proyecto de npm a pnpm para la instación de dependencias de nodejs por lo que debe tener en cuenta instalar las dependecias necesarias utilizando pnpm con el siguiente comando SI su entorno de desarrollo será bajo Windows.
>Habre una terminal PowerShell como administrador y ejecute el siguiente comando:
>```
> Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
>```
>En caso de que Windows rechace realizar cualquier instalación por detectarla como una ejecución maliciosa, indique a Windows Defender y agregue pnpm en las listas de excepciones con el siguinte comando:
> ```
> Add-MpPreference -ExclusionPath $(pnpm store path)
> ```
>Cualquier inconveniente comuniquelo con el administador.
>Para más información acerca de pnpm, aquí una guia rapida: https://youtu.be/MZ6JxWWCA5M?si=JLJivwlaz0gJ4s_F
>Documentación de pnpm: https://pnpm.io/es/motivation.
>El proceso de inicialización del proyecto con pnpm es el siguiente:
>1. Una vez teniendo pnpm funcionando en tu sistema, en el directorio del proyecto elimina los archivos <b>package-lock.json</b> y el directorio <b>node_modules/</b> en caso de haber estado trabajando en una versión anterior con npm:
>2. Posteriormente ejecuta el siguiente comando:
>   ```
>   pnpm install
>   ```
>   Este mismo instalara todas las dependiencias que esta utilizando el proyecto basado en el archivo original <i>package.json</i> de node.
>3. Por último, se generará el archivo <b>pnpm-lock.yaml</b>, asegurate de no tenerlo agregado al archivo <i>.gitignore<i/>
>4. Ejecuta el siguiente comando para limpiar el cache residual de npm en tu sistema:
>    ```
>    npm cache clean --force
>    ```

<h1> Para este proyecto se es necesario consultar que las tecnologias que utilicemos sean compatibles para lo que queremos hacer</h1>

REVISAR LO SIGUIENTE:

1. dependencias y compatibilidad con PostgresSQL: CONSULTAR documentación https://node-postgres.com/ **Y REVISAR LA DOCUMENTACIÓN OFICIAL DE Typescript:** https://www.typescriptlang.org/docs/ y en este apartado de la documentación de Node.js viene información acerca de la construcción de un proyecto, traducir esta parte de la documentación https://node-postgres.com/guides/async-express

Usaremos de typescript como lenguaje principal, postgresql como base de datos y express como framework para crear el servidor

<h1>PASO 1</h1> Clona el repositorio del proyecto con el siguiente comando en cualquier ubicación de tu equipo: 

```
git clone https://github.com/edRan21/Server-web-Teseracto.git
```

**Una vez que se clona todo el proyecto para revisar que cambios se le realizan al repositorio o en el desarrollo local ingresa este comando:**

```
git status 
```

**De igual forma, si es la primera vez que clonas el repositorio, o cada miembro del equipo de desarrollo realiza cambios es importante que ejecute el siguiente comando:**

```
git pull origin main
```

**Este comando sirve para actualizar los cambios que se esten haciendo del repositorio de github al del repositorio local, o sea el proyecto que clonaste del original no estará actualizado si en este caso alguien lo modifica así conforme si siga desarrollando y construyedo más código, archivos y carpetas**

*Para mayor informacion (yo también estaré estudiando), les recomiendo estudiar este video para conocer el funcionamiento de git y github, ya que el control de trabajo si debe realizarse de forma manual:*
https://youtu.be/3GymExBkKjE?si=zLJ2PQmF0lUdpPW_


<h3>Es recomendable que cada quien desarrolle en una rama personalizada que no sea main, main es unicamente la "ubicación" donde se juntarán lo cambios que se realice de la rama de cada desarrollador, en el que sea haya verificado funcional y sin ningún bug el código, archivos o alguna funcionalidad que se haya desarrollado</h3>

<h1> PASO 2 </h1> Instala las dependencias que necesitará el proyecto, estas estan basadas en los videos: https://youtu.be/Gqr15Uvhr6s?si=7ETVZ1CnEPppSSSF y https://youtu.be/8qteIhQe4ts?si=-L_I0pJiULw6vzlV

<h2>Paquetes y dependencias a instalar con el comando:</h2>

```
pnpm install class-validator cors dotenv express morgan typeorm typeorm-naming-strategies typescript
```

Breve descripción y función de cada depedencia:
1. class-validator: Permite generar validadores de clases sobre sus elementos a traves de sus decoradores, ejemplo: si es un email, etc

2. cors: Permite el cruzamiento de datos que cuando tenemos una aplicación "frontend" y esta consume una API, si no tenemos un core configurado que no tenga un origen especifico como una URL si no que sea una API publica, lo que pasará es que la politica de cors bloquerá ese consumo de datos.

3. odtenv: Manaja todas las variables de entorno, trabaja que tipo de ambiente vamos a trabajar: producción, desarrollo etc.

4. Express: Permite generar controladores, rutas para generar API de comunicación.

5. morgan: Es un especie de logger, por consola nos mostrara el tipo de ruta que estamos queriendo tomar y el tipo de solicitud (metodo): get, post, delete, etc, y el status de este. SE CONFIGURA EN EL PASO "Herramientas de inicio de de aplicación".

6. pg: Brinda las funciones que nos permitirá conectarnos a la base de datos de postgresql.

7. typeorm: Es una herramienta de mapeo objeto-relacional (ORM), permite trabajar con bases de datos utilizando conceptos de programación orientada a objetos en lugar de consultas SQL, nos permitira la gestion de estas de manera eficiente.

8. typeorm-naming-strategies: permite interactuar con identidades de la base de datos que estan escritas con el formato "snake_Case" escribiendolas con el formato "camelCase" configuradola desde la creación de los métodos sin tener tener problemas en el consumo de datos o en las peticiones.

9. typescript: Es la dependencia que nos brindará las funcionalidades de la sintaxis del lenguaje de programación Typescript unicamente funcional dentro del entorno de desarrollo, sin tener la que installar localmente.

Para instalar el uso de postgresql con nodejs:
```
pnpm install pg
```

**Dependencias de desarollo necesarias:**

```
pnpm install -D @types/cors @types/express @types/morgan concurrently nodemon
```

```
pnpm install --save pg   # Para PostgreSQL
```

```
pnpm install --save-dev @types/pg 
```

**"Estas dependencias no serán utilizadas en producción, no entran en el package.json"**

<h1> PASO 3 </h1> asegurarse de que typescript se encuentre debidamente instalado con el comando: 
```
tsc -v
``` 
<p1> En caso de que no funcione o aparezca "command not found" utlizar el comando:

```
pnpm install -g typescript 
```

</p1>
Este comando instalará Typescript de manera global en la computadora. Posteriormene intentar nuevamente ejecutar el comando: 

```
tsc -v
```

Una vez que se asegure de que se instalo correctamente ejecutará el siguente comando: 

```
tsc --init
```

<p1> Este comando generará un archivo de configuración para activar configuraciones de typescript </p1>

<p1> MPORTANTE PARA EL DESARROLLO: el archivo ".gitignore" literalmente ignora todo los archivos que especifiquemos aquí, como por ejemplo dependencias reinstalables, etc **(NO SUBIR VARIBLES DE ENTORNO, EN ESPECIFICO EL ARCHIVO '.env')** </p1>

<h2>Configuración de primeros Endopoints y ejecución de servidor</h2>

*Toda esta infomación la pueden consultar en el video: https://youtu.be/EpLUFVuJDm8?si=1EJmsZFr3e8sPsAh ciertos aspectos los sigo estudiando, de igual forma les invito a retroalimentar la documentación de este repositorio.*

El archivo "server.ts" es el punto de entrada y de ejecución de todo el servidor, este por si mismo es el que se encuentra separado de las demás conexiones a base de datos, controladores o funcionalidades. Para este momento 19/10/2025 se ha actualizado "package.json" agregando un nuevo comando en 'Script', nos permite que al realizar una nueva actualización se "refresque" todo el servidor con los cambios sin apagar el servidor y volverlo a levantar, el comando para esto es: 

```
pnpm run start:dev
```

Es importante investigar acerca de la **construcción de rutas para el servidor**, ya que podremos identificar en el archivo "server.ts" (por el momento) la creación de una ruta con el método **GET** que puse de ejemplo para su estudio y visualización.

<h5> A partir de este momento, todo lo que se escriba o se elabore será basado por conversaciones con la IA, además de los videos que he dejado en el principio de esta documentación.</h5>

**Esta es la lista de reproducción de la cual también me estoy guiando para la construcción del servidor: https://youtube.com/playlist?list=PLergODdA95keGVKSOPApWRw0XuA-ivH_u&si=UkJ6GArn_s6mdalj**

*dependencias nuevas brindadas por Deepseek:*

```
pnpm install reflect-metadata pg
pnpm install -D @types/pg
```

<h4> Descripción básica del uso de comandos, código y queries hacia la Base de Datos Teseracto. </h4>

**Si deseas recibir las credenciales reales de la base de datos comunicamente con el administrador**

1. Asegurate de tener la ruta *C:Users/FilePrograms/PostgreSQL/la-versión-instalada/bin* dentro de las variables de entorno en el *PATH*.
2. Ejecuta desde la PowerShell el comando:
```
psql -U postgres
```

**Si no funciona intenta con:**
```
psql -h localhost -U postgres -d postgres
```

**SI DE PLANO NO FUNCIONO, toma nota:**
* Tal vez se deba que lo servicios de PostgreSQL en el equipo esten inhabilitadas, esto ya que este tipo de softwares corren sus funciones en segundo plano a traves de la ejecución en nuestro equipo (si no me equivoco).
    - Por lo que deberás presionar *Windows + R* y poner en panel de busqueda *services.msc*, el cual abrirá un panel de gestión de los servicios del sistema operativo.
    - Deberás buscar alguno que indique "Posgres", darle clic al servicio y darle clic al botón *"iniciar"*, esto activiará los servicios de conexión a la base de datos.

3. Ingresa la contraseña de la DB
4. Una vez hecho esto podras ejecutar consultas o comandos SQL desde la terminal, POR EJEMPLO, si tienes acceso a la db Teseracto podras ejecutar:
```
psql -U postgres -d teseracto_db -c "\dt"
```
*Seria interesante probar si una maquina externa puede conectarse a la DB que no fuese en la maquina local*
en caso de que crear tu DB después de contectarte a Postgres, ejecuta:

```
CREATE DATABASE "el_nombre_de_la_db_que_crearas";
```
5. Para cerrar SQL desde la terminal, ejecuta:
```
\q
```


<h3> CONSTRUCCIÓN DEL SERVIDOR (basado en la IA y lista de reproducción que deje anteriormente en él) </h3>
<b> Es importante DESTACAR: que estudiar, entender y codear de poco a poco el desarrollo del servidor unicamente consultando a la IA para dudas, ES LA UNICA FORMA DE QUE EL SERVIDOR FUNCIONE UN LARGO TIEMPO SIN IMPLEMENTAR DEPLOYS QUE TRUENEN EL SERVIDOR. <b>
<p1> A lo largo de los archivos ire documentando las lineas de código para que sean más faciles de entender, esto para documentar cada funcionalidad y proposito para la implementación de futuras actualizaciones o mantenimientos o inclusive la integración de colaboradores. </p1>

Modelo del sistema Teseracto-Server versión 1.0.0:

    1. Modelo MVC (Model-Viewer-Controller)

        1.1 El sistema basado en este Patron de Diseño tiene como propósito a que el usuario tenga al alcance la respuesta del servidor ante su solicitud. El *viewer* (el usuario ó frontend) solicita un recurso del servidor, el *controller* (organiza unicamente la información **necesaria** para el usuario, maneja los request y los responses) del *Model* o la lógica detras del almacenamiento de este(os) recursos.

    2. Responsabilidades separadas de forma modular.

        2.1 Con esto la arquitectura de archivos estará pensada para que cada responsabilidad este separada, DE ESTE MODO, la funcionalidad o la responsabilidad de una conexión o endpoint, ETC, se encuentre unicamente en un modulo, directorio o carpeta.

    3. Principio SOLID
        3.1 Una clase (me parece que en este caso con Typescript ya que funciona con principios de POO) harán una unica función, cerrado a modificación y abierto a extensión, las dependencias deben ser abstractas NO de implementaciones, o no me acuerdo que más. (otro aspecto a estudiar)
    
    4. Motor de base de datos: PostgreSQL
        4.1 La Data Base es un aspecto importante y delicado, es importante estan informado de su correcta utilización, ya que las consultas deben estar correctamente optimizadas. 
    
    5. Programación Orientada a Objetos.
        5.1 Typescript es de un tipado estricto, además de eso se caracteriza por ser una "versión" Java de JavaScript al programar obligatoriamente con el paradigma Orientado a Objetos (el dominio de este paradigma es codeando problemas de esta forma una vez estudiandolo y entendiendolo, pues la practica de abstrear un problema a este tipo desarrolla la lógica con este paradigma)


<h5> Como entender TypeORM, construcción de entidades, clases y tipos</h5>
¿Es más difil entender algo o creandolo?, en realidad la siguientes explicaciones son la punta del iceberg sobre el funcionamiento de las bases de datos en código.

TypeORM es la dependencia que nos ayuda a modelar la construcción de una Base de datos o mapear su estructura **en código**. para esto es clave entender como se define:
1. Entidad.
La entidad es como se denomina o representa una tabla en código, en Typescript para **DEFINIR** a una tabla (y en general a cualquier "propiedad" de una base de datos) utilizamos el signo de **@**.

Ejemplo:

```
// sintaxys Typescript

 @Entity(´users´)  

// "users" es el nombre que tiene la tabla o recibirá la tabla 
```

De igual forma sucede lo mismo con las columnas, solamente que estas si no me equivoco tendran como parametros las caracteristicas de la columna como el tipo, la longitud, etc. *(recomeendable estudiar a profundiad)*

ejemplo: 

```
 @Column({ type: 'varchar', length: 20})
  role: string;               // ← Columna con restricciones
```
Además de otros como:

- **@PrimaryGeneratedColumn()** - Llave primaria

- **@CreateDateColumn()** - Fecha de creación automática

Seguire es su estudio para un mejor entendimiento y documentarlo en el repositorio, se recomienda revisar el código y los comentarios que proximamente dejaré.

<h4> Palabras reservadas de SQL para escribir comandos para el uso de herramientas de la base de datos de PostgreSQL </h4>

1. Comandos de Query.
    * **SELECT** : esta palabra sirve para tomar o seleccionar (como su nombre lo dice 'SELECT') una una entidad o propiedad creada de la base de datos para consultar; comúnmente se utiliza para **filtrar** que elementos de la DB ver, por ejemplo, *seleccionar* los "elementos" escribiendo el nombre de una columna, de las columnas o de esos elementos que quieres consultar.
    * **FROM** : esta palabra sirve como un complemeneto del *SELECT* pues este le indica a este de **DONDE** tomará los datos a consultar, por lo general se escribe el nombre de la tabla en donde se encontrarán los elementos *seleccionados*. 
