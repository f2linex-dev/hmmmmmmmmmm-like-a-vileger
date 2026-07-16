import { KMPFile } from '../types';

export const kmpCodebase: KMPFile[] = [
  // --- Root Gradle Files ---
  {
    name: 'build.gradle.kts',
    path: 'build.gradle.kts',
    language: 'kotlin',
    content: `plugins {
    // This is the main Gradle build file for the Multiplatform project
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.androidLibrary) apply false
    alias(libs.plugins.jetbrainsCompose) apply false
    alias(libs.plugins.compose.compiler) apply false
    alias(libs.plugins.kotlinMultiplatform) apply false
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    }
}
`
  },
  {
    name: 'settings.gradle.kts',
    path: 'settings.gradle.kts',
    language: 'kotlin',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
    }
}

rootProject.name = "VillagerHmm"
include(":shared")
include(":androidApp")
`
  },
  {
    name: 'gradle.properties',
    path: 'gradle.properties',
    language: 'properties',
    content: `# Gradle Properties for Kotlin Multiplatform project
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
kotlin.code.style=official
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.mpp.enableCInteropCommonization=true
`
  },

  // --- Shared Module Gradle ---
  {
    name: 'build.gradle.kts',
    path: 'shared/build.gradle.kts',
    language: 'kotlin',
    content: `plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
    alias(libs.plugins.jetbrainsCompose)
    alias(libs.plugins.compose.compiler)
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = "17"
            }
        }
    }
    
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "shared"
            isStatic = true
        }
    }
    
    jvm("desktop")

    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.components.resources)
            implementation(compose.components.uiToolingPreview)
        }
        
        androidMain.dependencies {
            implementation(libs.androidx.appcompat)
            implementation(libs.androidx.activity.compose)
        }
        
        iosMain.dependencies {
            // iOS specific dependencies (e.g. platform APIs)
        }
        
        val desktopMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
            }
        }
    }
}

android {
    namespace = "com.villager.hmm"
    compileSdk = 34
    defaultConfig {
        minSdk = 24
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
`
  },

  // --- Shared expect/actual SoundPlayer ---
  {
    name: 'SoundPlayer.kt',
    path: 'shared/src/commonMain/kotlin/com/villager/hmm/audio/SoundPlayer.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.audio

/**
 * Expected interface implemented by each target platform (Android, iOS, Desktop)
 * to provide low-latency audio playback of the Villager "Hmm" sound effect.
 */
expect class SoundPlayer() {
    /**
     * Preloads the audio asset to ensure instant playback when requested.
     * @param resourcePath Path to the audio file in common resources (e.g., "files/villager_hmm.mp3")
     */
    fun preload(resourcePath: String)

    /**
     * Plays the preloaded sound with low latency.
     */
    fun play()

    /**
     * Stops and releases any native audio players or system resources.
     */
    fun release()
}
`
  },
  {
    name: 'SoundPlayer.android.kt',
    path: 'shared/src/androidMain/kotlin/com/villager/hmm/audio/SoundPlayer.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

/**
 * Android implementation using SoundPool for ultra-low latency playback.
 * Ideal for short sound effects like a Villager "Hmm".
 */
actual class SoundPlayer {
    private var context: Context? = null
    private var soundPool: SoundPool? = null
    private var soundId: Int = -1
    private var isLoaded = false

    constructor(context: Context) {
        this.context = context
        initializeSoundPool()
    }

    /**
     * Default secondary constructor required to fulfill the expect class signature
     */
    actual constructor() {
        // Will be initialized when context is provided, or uses a fallback context
    }

    private fun initializeSoundPool() {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(3)
            .setAudioAttributes(audioAttributes)
            .build()

        soundPool?.setOnLoadCompleteListener { _, _, status ->
            if (status == 0) {
                isLoaded = true
            }
        }
    }

    actual fun preload(resourcePath: String) {
        val ctx = context ?: return
        try {
            // In a real KMP app, resources are loaded from assets or raw resources
            // Let's assume 'resourcePath' corresponds to an asset name
            val assetFileDescriptor = ctx.assets.openFd(resourcePath)
            soundId = soundPool?.load(assetFileDescriptor, 1) ?: -1
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    actual fun play() {
        if (isLoaded && soundId != -1) {
            // Play sound with: leftVolume, rightVolume, priority, loop, rate
            soundPool?.play(soundId, 1.0f, 1.0f, 1, 0, 1.0f)
        }
    }

    actual fun release() {
        soundPool?.release()
        soundPool = null
        isLoaded = false
        soundId = -1
    }
}
`
  },
  {
    name: 'SoundPlayer.ios.kt',
    path: 'shared/src/iosMain/kotlin/com/villager/hmm/audio/SoundPlayer.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.audio

import platform.AVFoundation.AVAudioPlayer
import platform.Foundation.NSBundle
import platform.Foundation.NSURL

/**
 * iOS implementation using AVAudioPlayer for low-latency native sound playback.
 */
actual class SoundPlayer actual constructor() {
    private var player: AVAudioPlayer? = null

    actual fun preload(resourcePath: String) {
        try {
            // Extract file name and extension from path
            val pathParts = resourcePath.split('.')
            val name = pathParts.getOrNull(0) ?: "villager_hmm"
            val extension = pathParts.getOrNull(1) ?: "mp3"

            val bundlePath = NSBundle.mainBundle.pathForResource(name, extension)
            if (bundlePath != null) {
                val url = NSURL.fileURLWithPath(bundlePath)
                player = AVAudioPlayer(url, null)
                player?.prepareToPlay()
            }
        } catch (e: Exception) {
            // Handle iOS audio loading error
        }
    }

    actual fun play() {
        if (player?.isPlaying() == true) {
            player?.stop()
            player?.setCurrentTime(0.0)
        }
        player?.play()
    }

    actual fun release() {
        player?.stop()
        player = null
    }
}
`
  },
  {
    name: 'SoundPlayer.desktop.kt',
    path: 'shared/src/desktopMain/kotlin/com/villager/hmm/audio/SoundPlayer.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.audio

import java.io.BufferedInputStream
import javax.sound.sampled.AudioSystem
import javax.sound.sampled.Clip

/**
 * Desktop (JVM) implementation using the javax.sound.sampled API.
 */
actual class SoundPlayer actual constructor() {
    private var clip: Clip? = null

    actual fun preload(resourcePath: String) {
        try {
            val classLoader = Thread.currentThread().contextClassLoader
            val soundStream = classLoader.getResourceAsStream(resourcePath)
            if (soundStream != null) {
                val bufferedStream = BufferedInputStream(soundStream)
                val audioStream = AudioSystem.getAudioInputStream(bufferedStream)
                
                clip = AudioSystem.getClip()
                clip?.open(audioStream)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    actual fun play() {
        val activeClip = clip ?: return
        try {
            if (activeClip.isRunning) {
                activeClip.stop()
            }
            activeClip.framePosition = 0
            activeClip.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    actual fun release() {
        clip?.close()
        clip = null
    }
}
`
  },

  // --- Shared Custom Theme ---
  {
    name: 'Theme.kt',
    path: 'shared/src/commonMain/kotlin/com/villager/hmm/theme/Theme.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Minecraft Theme Color Palettes (Rich, blocky, earthy tones)
val VillageGreen = Color(0xFF5B8731)
val VillageSkyLight = Color(0xFF8BB5FF)
val VillageSkyDark = Color(0xFF10162F)
val GrassGreen = Color(0xFF4C7B2C)
val OakWood = Color(0xFF866043)
val Cobblestone = Color(0xFF737373)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF8D5D3E), // Brownish villager color
    secondary = Color(0xFF5C8E32), // Emerald/grass green
    tertiary = Color(0xFFD4A373), // Tan nose color
    background = Color(0xFFF4F1DE), // Warm cream
    surface = Color(0xFFE9D8A6), // Warm sand
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF264653),
    onSurface = Color(0xFF264653)
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF6B442B), // Darker villager tone
    secondary = Color(0xFF385E1E), // Dark grass green
    tertiary = Color(0xFF9C6A3F), // Dusty brown nose color
    background = Color(0xFF141A29), // Night sky blue
    surface = Color(0xFF232D42), // Dark deep slate
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFFE0E6ED),
    onSurface = Color(0xFFE0E6ED)
)

@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
`
  },

  // --- Shared VillageBackground Component ---
  {
    name: 'VillageBackground.kt',
    path: 'shared/src/commonMain/kotlin/com/villager/hmm/components/VillageBackground.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color

/**
 * A beautiful, highly performant pixel-art style village background drawn using Canvas,
 * reacting smoothly to Day/Night mode settings.
 */
@Composable
fun VillageBackground(
    isDarkMode: Boolean,
    modifier: Modifier = Modifier
) {
    // Colors of nature
    val skyColor = if (isDarkMode) Color(0xFF0F1423) else Color(0xFF70A5F9)
    val moonSunColor = if (isDarkMode) Color(0xFFEBEFF5) else Color(0xFFFFE066)
    val cloudColor = if (isDarkMode) Color(0xFF21293D) else Color(0xFFFFFFFF)
    
    // Land and village structures (Browns, Greens, Slates)
    val ridgeColor1 = if (isDarkMode) Color(0xFF1B2C1C) else Color(0xFF436E27)
    val ridgeColor2 = if (isDarkMode) Color(0xFF142215) else Color(0xFF385C20)
    val groundColor = if (isDarkMode) Color(0xFF0E170F) else Color(0xFF2E4D1A)
    
    val houseWood = if (isDarkMode) Color(0xFF3B2A1E) else Color(0xFF7C583E)
    val houseRoof = if (isDarkMode) Color(0xFF2D2E2E) else Color(0xFF67696B)
    val windowGlow = if (isDarkMode) Color(0xFFFFD54F) else Color(0xFFEBEFF5)

    Box(modifier = modifier.fillMaxSize().background(skyColor)) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // 1. Draw Sun or Moon (Blocky square style)
            val orbSize = 80f
            val orbX = if (isDarkMode) width * 0.75f else width * 0.20f
            val orbY = height * 0.15f
            drawRect(
                color = moonSunColor,
                topLeft = Offset(orbX, orbY),
                size = Size(orbSize, orbSize)
            )

            // 2. Draw Stars in dark mode
            if (isDarkMode) {
                val starColor = Color.White.copy(alpha = 0.8f)
                val stars = listOf(
                    Offset(width * 0.1f, height * 0.1f),
                    Offset(width * 0.3f, height * 0.05f),
                    Offset(width * 0.45f, height * 0.18f),
                    Offset(width * 0.6f, height * 0.08f),
                    Offset(width * 0.85f, height * 0.25f),
                    Offset(width * 0.95f, height * 0.12f)
                )
                stars.forEach { star ->
                    drawRect(color = starColor, topLeft = star, size = Size(10f, 10f))
                }
            }

            // 3. Draw Cubic Clouds
            drawRect(color = cloudColor.copy(alpha = 0.7f), topLeft = Offset(width * 0.1f, height * 0.22f), size = Size(200f, 60f))
            drawRect(color = cloudColor.copy(alpha = 0.7f), topLeft = Offset(width * 0.15f, height * 0.25f), size = Size(140f, 50f))
            drawRect(color = cloudColor.copy(alpha = 0.5f), topLeft = Offset(width * 0.65f, height * 0.18f), size = Size(280f, 70f))

            // 4. Background Ridges/Hills (Blocky/Stepped steps)
            val stepSize = 40f
            // Ridge 1
            var rx = 0f
            while (rx < width) {
                val ry = height * 0.65f + (if ((rx / 120f).toInt() % 2 == 0) 30f else 0f)
                drawRect(
                    color = ridgeColor1,
                    topLeft = Offset(rx, ry),
                    size = Size(121f, height - ry)
                )
                rx += 120f
            }

            // Ridge 2
            rx = -60f
            while (rx < width) {
                val ry = height * 0.73f + (if ((rx / 160f).toInt() % 3 == 0) 40f else 0f)
                drawRect(
                    color = ridgeColor2,
                    topLeft = Offset(rx, ry),
                    size = Size(161f, height - ry)
                )
                rx += 160f
            }

            // 5. Ground Floor
            drawRect(
                color = groundColor,
                topLeft = Offset(0f, height * 0.82f),
                size = Size(width, height * 0.18f)
            )

            // 6. Draw Pixel-Art Houses
            // House 1 (Left)
            val h1x = width * 0.15f
            val h1y = height * 0.70f
            drawRect(color = houseWood, topLeft = Offset(h1x, h1y), size = Size(100f, 80f))
            drawRect(color = houseRoof, topLeft = Offset(h1x - 10f, h1y - 20f), size = Size(120f, 20f))
            drawRect(color = windowGlow, topLeft = Offset(h1x + 35f, h1y + 25f), size = Size(30f, 30f))

            // House 2 (Right)
            val h2x = width * 0.70f
            val h2y = height * 0.68f
            drawRect(color = houseWood, topLeft = Offset(h2x, h2y), size = Size(120f, 90f))
            drawRect(color = houseRoof, topLeft = Offset(h2x - 15f, h2y - 24f), size = Size(150f, 24f))
            drawRect(color = windowGlow, topLeft = Offset(h2x + 25f, h2y + 30f), size = Size(30f, 30f))
            drawRect(color = windowGlow, topLeft = Offset(h2x + 65f, h2y + 30f), size = Size(30f, 30f))
            
            // Village pathways / wells in blocky shape
            drawRect(color = Color(0xFF6D5A47), topLeft = Offset(width * 0.45f, height * 0.85f), size = Size(80f, height * 0.15f))
        }
    }
}
`
  },

  // --- Shared VillagerNoseButton Component ---
  {
    name: 'VillagerNoseButton.kt',
    path: 'shared/src/commonMain/kotlin/com/villager/hmm/components/VillagerNoseButton.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp

/**
 * A highly interactive Minecraft villager's nose button.
 * Drawn purely with Compose Canvas using blocky pixel textures and layered shadows
 * to create a distinctive 3D-block voxel look.
 * Includes tactile squish/scale feedback on press.
 */
@Composable
fun VillagerNoseButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isPressed by remember { mutableStateOf(false) }

    // Smooth physics-like bounce animation for the "squish" effect
    val scaleX by animateFloatAsState(
        targetValue = if (isPressed) 0.88f else 1.0f,
        animationSpec = tween(durationMillis = 80)
    )
    val scaleY by animateFloatAsState(
        targetValue = if (isPressed) 0.82f else 1.0f,
        animationSpec = tween(durationMillis = 80)
    )

    Box(
        modifier = modifier
            .size(160.dp, 240.dp)
            .graphicsLayer {
                this.scaleX = scaleX
                this.scaleY = scaleY
                this.transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0.5f, 0.9f) // Squish from bottom anchor
            }
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        isPressed = true
                        tryAwaitRelease()
                        isPressed = false
                    },
                    onTap = {
                        onClick()
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // Define Minecraft Villager Nose pixel dimensions (Classic block style)
            // It's a vertical box with specific brownish/fleshy tones
            val noseColor = Color(0xFFBC8060)         // Core flesh-brown
            val highlightColor = Color(0xFFCF997A)    // Top/Left highlight
            val shadowColor = Color(0xFF985F44)       // Bottom shadow
            val deepShadowColor = Color(0xFF6E3F28)   // Side deep shadow
            val pixelGridColor = Color(0x334E2A18)    // Subtle grid overlays

            // 1. Draw outer 3D drop shadow
            drawRect(
                color = Color.Black.copy(alpha = 0.35f),
                topLeft = Offset(16f, 20f),
                size = Size(w, h),
            )

            // 2. Base Nose shape
            drawRect(
                color = noseColor,
                topLeft = Offset(0f, 0f),
                size = Size(w, h)
            )

            // 3. Highlight on Top and Left (creates block volume)
            drawRect(
                color = highlightColor,
                topLeft = Offset(0f, 0f),
                size = Size(w, 20f) // Top lip highlight
            )
            drawRect(
                color = highlightColor,
                topLeft = Offset(0f, 0f),
                size = Size(20f, h) // Left edge highlight
            )

            // 4. Shadow on Bottom and Right
            drawRect(
                color = shadowColor,
                topLeft = Offset(0f, h - 24f),
                size = Size(w, 24f) // Bottom shadow
            )
            drawRect(
                color = deepShadowColor,
                topLeft = Offset(w - 24f, 0f),
                size = Size(24f, h) // Right side depth shadow
            )

            // 5. Blocky Minecraft Pixel details (Adds the authentic texture)
            val pxSizeW = w / 8f
            val pxSizeH = h / 12f

            // Overlay custom pixels of varying tints for the voxel look
            val gridCoords = listOf(
                Pair(1, 2) to highlightColor.copy(alpha = 0.8f),
                Pair(2, 4) to shadowColor.copy(alpha = 0.6f),
                Pair(4, 3) to deepShadowColor.copy(alpha = 0.4f),
                Pair(3, 7) to highlightColor.copy(alpha = 0.5f),
                Pair(5, 8) to shadowColor.copy(alpha = 0.7f),
                Pair(1, 9) to deepShadowColor.copy(alpha = 0.5f),
                Pair(4, 10) to highlightColor.copy(alpha = 0.6f),
                Pair(2, 11) to shadowColor.copy(alpha = 0.5f)
            )

            gridCoords.forEach { (coord, color) ->
                val (gridX, gridY) = coord
                drawRect(
                    color = color,
                    topLeft = Offset(gridX * pxSizeW, gridY * pxSizeH),
                    size = Size(pxSizeW, pxSizeH)
                )
            }

            // Draw a subtle dark border around the nose for a comic/retro finish
            drawRect(
                color = Color(0xFF331D12),
                topLeft = Offset(0f, 0f),
                size = Size(w, h),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 8f)
            )
        }
    }
}
`
  },

  // --- Shared App.kt entry point ---
  {
    name: 'App.kt',
    path: 'shared/src/commonMain/kotlin/com/villager/hmm/App.kt',
    language: 'kotlin',
    content: `package com.villager.hmm

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.villager.hmm.audio.SoundPlayer
import com.villager.hmm.components.VillageBackground
import com.villager.hmm.components.VillagerNoseButton
import com.villager.hmm.theme.AppTheme

@Composable
fun App() {
    var isDarkMode by remember { mutableStateOf(false) }
    var statsClicks by remember { mutableStateOf(0) }
    var currentDialogue by remember { mutableStateOf("Tap my nose... I dare you.") }
    
    // Instantiate our native expect/actual Sound Player
    val soundPlayer = remember { SoundPlayer() }

    // Preload audio on startup
    LaunchedEffect(Unit) {
        soundPlayer.preload("villager_hmm.mp3")
    }

    // Release audio on dispose
    DisposableEffect(Unit) {
        onDispose {
            soundPlayer.release()
        }
    }

    // Quotes database for the Villager dialog balloon
    val villagerQuotes = listOf(
        "Hmm...",
        "Hmm? What do you want?",
        "Hrrmm. Emeralds, please!",
        "Hmmmm. Fair deal!",
        "Hrrrm. Look at my nose!",
        "Hmm! That tickled!",
        "Hmhmm. 24 Coal for 1 Emerald, deal?",
        "Hrrm? Do you have Wheat?"
    )

    AppTheme(darkTheme = isDarkMode) {
        Box(modifier = Modifier.fillMaxSize()) {
            
            // 1. Pixel Art Village Background (Reacts to day/night toggle)
            VillageBackground(isDarkMode = isDarkMode)

            // 2. Main Content Layout
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .systemBarsPadding(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top Action Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Title Logo
                    Column {
                        Text(
                            text = "VILLAGER HMM",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            textAlign = TextAlign.Start,
                            modifier = Modifier.background(Color.Black.copy(alpha = 0.5f)).padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    // Theme Toggle Button
                    IconButton(
                        onClick = { isDarkMode = !isDarkMode },
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.5f))
                            .clip(RoundedCornerShape(4.dp))
                    ) {
                        Text(
                            text = if (isDarkMode) "🌙" else "☀️",
                            fontSize = 20.sp,
                            color = Color.White
                        )
                    }
                }

                // Midsection: Villager Speech Bubble + Giant Nose Button
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.weight(1f)
                ) {
                    // Minecraft Speech Bubble
                    Box(
                        modifier = Modifier
                            .padding(bottom = 24.dp)
                            .background(Color(0xFFF7F5F0))
                            .padding(12.dp)
                            .background(Color(0xFFE5DFD3))
                            .padding(12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = currentDialogue,
                            fontSize = 18.sp,
                            color = Color(0xFF2E2C29),
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.Center
                        )
                    }

                    // The Interactive Villager Nose Button
                    VillagerNoseButton(
                        onClick = {
                            // Play the expect/actual sound player
                            soundPlayer.play()
                            
                            // Update interactive states
                            statsClicks++
                            currentDialogue = villagerQuotes.random()
                        }
                    )
                }

                // Bottom Stats & Trading Board (Authentic voxel-card look)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .background(Color.Black.copy(alpha = 0.65f))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "TRADING LEVEL: MASTER",
                                fontSize = 12.sp,
                                color = Color(0xFFFFD54F),
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Total HMMs triggered: $statsClicks",
                                fontSize = 14.sp,
                                color = Color.White
                            )
                        }
                        
                        // Show inventory placeholder (Emeralds matching click count!)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "🟢 x$statsClicks",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF55FF55)
                            )
                        }
                    }
                }
            }
        }
    }
}
`
  },

  // --- Android App Launcher & Manifest ---
  {
    name: 'AndroidManifest.xml',
    path: 'androidApp/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.villager.hmm.android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Villager Hmm"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@android:style/Theme.NoTitleBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    name: 'MainActivity.kt',
    path: 'androidApp/src/main/java/com/villager/hmm/android/MainActivity.kt',
    language: 'kotlin',
    content: `package com.villager.hmm.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.villager.hmm.App

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            App()
        }
    }
}
`
  },
  {
    name: 'build.gradle.kts',
    path: 'androidApp/build.gradle.kts',
    language: 'kotlin',
    content: `plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinMultiplatform)
}

kotlin {
    androidTarget()
}

android {
    namespace = "com.villager.hmm.android"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.villager.hmm"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":shared"))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.appcompat)
}
`
  },

  // --- iOS App Entries ---
  {
    name: 'iOSApp.swift',
    path: 'iosApp/iosApp/iOSApp.swift',
    language: 'swift',
    content: `import SwiftUI
import shared

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
`
  },
  {
    name: 'ContentView.swift',
    path: 'iosApp/iosApp/ContentView.swift',
    language: 'swift',
    content: `import SwiftUI
import shared

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea(.all, edges: .all)
    }
}

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        AppKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
`
  }
];
