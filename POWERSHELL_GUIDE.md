# Créer une commande PowerShell personnalisée pour ouvrir un site web en mode application

Ce guide explique comment créer une commande PowerShell personnalisée qui ouvre un site web spécifique en mode application (également appelé mode PWA ou Web App) en utilisant les navigateurs Google Chrome ou Microsoft Edge. Cela permet d'avoir une expérience plus immersive, sans l'interface complète du navigateur.

## 1. Comprendre le mode application des navigateurs

Les navigateurs modernes comme Chrome et Edge permettent d'ouvrir des sites web dans une fenêtre simplifiée, sans barre d'adresse, onglets ou autres éléments d'interface utilisateur du navigateur. Cela est particulièrement utile pour les Progressive Web Apps (PWA) ou pour transformer n'importe quel site web en une "application" de bureau.

La syntaxe générale pour lancer un navigateur en mode application via la ligne de commande est la suivante :

*   **Google Chrome**:
    `"C:\Program Files\Google\Chrome\Application\chrome.exe" --app=https://www.example.com`

*   **Microsoft Edge**:
    `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=https://www.example.com`

Notez que les chemins d'accès aux exécutables peuvent varier en fonction de votre installation.

## 2. Ouvrir un site en mode application via PowerShell

Vous pouvez utiliser la commande `Start-Process` de PowerShell pour exécuter ces commandes. Voici des exemples :

### Pour Google Chrome

```powershell
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "https://www.google.com"
Start-Process -FilePath $chromePath -ArgumentList "--app=$url"
```

### Pour Microsoft Edge

```powershell
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$url = "https://www.bing.com"
Start-Process -FilePath $edgePath -ArgumentList "--app=$url"
```

## 3. Créer une fonction PowerShell personnalisée nommée "Yousuck"

Pour rendre cette opération plus pratique et utiliser le nom de commande que vous avez spécifié, vous pouvez créer une fonction PowerShell et un alias. Cela vous permettra d'appeler votre site en mode application avec la commande `Yousuck`.

Voici un exemple de fonction qui ouvre un site spécifique avec Chrome en mode application, et un alias pour l'appeler simplement `Yousuck` :

```powershell
function Open-MyWebsiteAsAppYousuck {
    param(
        [string]$Url = "https://www.roblox.com" # Remplacez par votre URL par défaut
    )
    $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (-not (Test-Path $chromePath)) {
        Write-Error "Google Chrome n'est pas trouvé à l'emplacement spécifié : $chromePath"
        return
    }
    Start-Process -FilePath $chromePath -ArgumentList "--app=$Url"
}

Set-Alias -Name Yousuck -Value Open-MyWebsiteAsAppYousuck
```

Vous pouvez personnaliser cette fonction :
*   Modifiez l'URL par défaut (`https://www.roblox.com`) par celle de votre site.
*   Vous pouvez ajouter une logique pour choisir entre Chrome et Edge, ou pour permettre à l'utilisateur de spécifier le navigateur.

## 4. Rendre la commande persistante (Profil PowerShell)

Pour que votre fonction personnalisée et son alias soient disponibles chaque fois que vous ouvrez PowerShell, vous devez les ajouter à votre profil PowerShell.

1.  **Vérifier l'existence du profil**:
    Exécutez la commande suivante dans PowerShell pour voir le chemin de votre fichier de profil :
    ```powershell
    $PROFILE
    ```
    Si le fichier n'existe pas, la commande renverra un chemin mais le fichier ne sera pas présent.

2.  **Créer le fichier de profil (si nécessaire)**:
    Si le fichier n'existe pas, créez-le avec la commande suivante :
    ```powershell
    New-Item -Path $PROFILE -ItemType File -Force
    ```

3.  **Ouvrir le fichier de profil**:
    Ouvrez le fichier de profil dans un éditeur de texte (par exemple, Notepad) :
    ```powershell
    notepad $PROFILE
    ```

4.  **Ajouter votre fonction et l'alias au profil**:
    Copiez et collez la fonction `Open-MyWebsiteAsAppYousuck` et la ligne `Set-Alias -Name Yousuck -Value Open-MyWebsiteAsAppYousuck` dans ce fichier et enregistrez-le.

Maintenant, chaque fois que vous ouvrirez une nouvelle session PowerShell, vous pourrez simplement taper `Yousuck` pour lancer votre site en mode application.

## Références

*   [Deploy Edge/Chrome Site as App and Customize desktop shortcut](https://community.spiceworks.com/t/deploy-edge-chrome-site-as-app-and-customize-desktop-shortcut/785931) [1]
*   [Customizing your shell environment - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/creating-profiles?view=powershell-7.6) [2]
