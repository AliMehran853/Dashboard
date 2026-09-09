// =========================================================
// Profile Image Utilities
// =========================================================


// =========================================================
// Constants
// =========================================================

const MAX_INPUT_SIZE =
    5 * 1024 * 1024; // 5 MB


const MAX_OUTPUT_SIZE =
    150 * 1024; // 150 KB


const MAX_DIMENSION =
    256;


const CROP_OUTPUT_DIMENSION =
    256;


const FALLBACK_CROP_DIMENSION =
    192;


const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];


// =========================================================
// Vignette Settings
// =========================================================

/*
 * شدت Vignette عمداً کم نگه داشته شده
 * تا مرکز عکس و چهره شفاف باقی بماند.
 */

const VIGNETTE_START =
    0.46;


const VIGNETTE_MID =
    0.68;


const VIGNETTE_NEAR_EDGE =
    0.86;


const VIGNETTE_END_OPACITY =
    0.18;


// =========================================================
// Image Validation
// =========================================================

export function validateImageFile(
    file
) {

    if (!file) {

        return {
            valid: false,
            message:
                'لطفاً یک عکس انتخاب کنید.',
        };

    }


    if (
        !ALLOWED_TYPES.includes(
            file.type
        )
    ) {

        return {
            valid: false,
            message:
                'فرمت عکس پشتیبانی نمی‌شود. فقط JPG، JPEG، PNG و WEBP مجاز است.',
        };

    }


    if (
        file.size >
        MAX_INPUT_SIZE
    ) {

        return {
            valid: false,
            message:
                'حجم عکس بیشتر از ۵ مگابایت است. لطفاً عکس کوچک‌تری انتخاب کنید.',
        };

    }


    return {
        valid: true,
        message: '',
    };

}


// =========================================================
// Load Image From File
// =========================================================

function loadImage(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                const image =
                    new Image();


                image.onload = () => {

                    resolve(
                        image
                    );

                };


                image.onerror = () => {

                    reject(
                        new Error(
                            'خواندن تصویر امکان‌پذیر نیست.'
                        )
                    );

                };


                image.src =
                    reader.result;

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        'خواندن فایل تصویر انجام نشد.'
                    )
                );

            };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================================
// Load Image From Data URL
// =========================================================

function loadImageFromDataUrl(
    dataUrl
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const image =
                new Image();


            image.onload = () => {

                resolve(
                    image
                );

            };


            image.onerror = () => {

                reject(
                    new Error(
                        'بارگذاری تصویر پردازش‌شده انجام نشد.'
                    )
                );

            };


            image.src =
                dataUrl;

        }
    );

}


// =========================================================
// Calculate Dimensions
// =========================================================

function calculateDimensions(
    width,
    height,
    maxDimension = MAX_DIMENSION
) {

    if (
        width <= maxDimension &&
        height <= maxDimension
    ) {

        return {
            width,
            height,
        };

    }


    const ratio =
        Math.min(
            maxDimension / width,
            maxDimension / height
        );


    return {

        width:
            Math.max(
                1,
                Math.round(
                    width * ratio
                )
            ),

        height:
            Math.max(
                1,
                Math.round(
                    height * ratio
                )
            ),

    };

}


// =========================================================
// Normalize Crop Area
// =========================================================

export function normalizeCropArea(
    cropArea,
    imageWidth,
    imageHeight
) {

    if (
        !cropArea ||
        imageWidth <= 0 ||
        imageHeight <= 0
    ) {

        const size =
            Math.min(
                imageWidth,
                imageHeight
            );


        return {

            x:
                Math.max(
                    0,
                    (imageWidth - size) / 2
                ),

            y:
                Math.max(
                    0,
                    (imageHeight - size) / 2
                ),

            width:
                size,

            height:
                size,

        };

    }


    let x =
        Number(
            cropArea.x
        );


    let y =
        Number(
            cropArea.y
        );


    let width =
        Number(
            cropArea.width
        );


    let height =
        Number(
            cropArea.height
        );


    if (
        !Number.isFinite(x)
    ) {
        x = 0;
    }


    if (
        !Number.isFinite(y)
    ) {
        y = 0;
    }


    if (
        !Number.isFinite(width) ||
        width <= 0
    ) {

        width =
            Math.min(
                imageWidth,
                imageHeight
            );

    }


    if (
        !Number.isFinite(height) ||
        height <= 0
    ) {

        height =
            Math.min(
                imageWidth,
                imageHeight
            );

    }


    // -----------------------------------------------------
    // Crop مربعی
    // -----------------------------------------------------

    const squareSize =
        Math.min(
            width,
            height,
            imageWidth,
            imageHeight
        );


    width =
        squareSize;


    height =
        squareSize;


    // -----------------------------------------------------
    // Clamp
    // -----------------------------------------------------

    x =
        Math.max(
            0,
            Math.min(
                x,
                imageWidth - width
            )
        );


    y =
        Math.max(
            0,
            Math.min(
                y,
                imageHeight - height
            )
        );


    return {

        x:
            Math.round(x),

        y:
            Math.round(y),

        width:
            Math.round(width),

        height:
            Math.round(height),

    };

}


// =========================================================
// Center Crop
// =========================================================

export function getCenterCrop(
    imageWidth,
    imageHeight
) {

    if (
        imageWidth <= 0 ||
        imageHeight <= 0
    ) {

        return {

            x: 0,
            y: 0,
            width: 0,
            height: 0,

        };

    }


    const size =
        Math.min(
            imageWidth,
            imageHeight
        );


    return {

        x:
            (imageWidth - size) / 2,

        y:
            (imageHeight - size) / 2,

        width:
            size,

        height:
            size,

    };

}


// =========================================================
// Clamp Crop Area
// =========================================================

export function clampCropArea(
    cropArea,
    imageWidth,
    imageHeight
) {

    return normalizeCropArea(
        cropArea,
        imageWidth,
        imageHeight
    );

}


// =========================================================
// Data URL To Bytes
// =========================================================

export function dataUrlToBytes(
    dataUrl
) {

    if (
        typeof dataUrl !==
        'string'
    ) {

        return 0;

    }


    const base64 =
        dataUrl.split(',')[1] ||
        '';


    if (!base64) {
        return 0;
    }


    return Math.floor(
        (
            base64.length * 3
        ) / 4
    );

}


// =========================================================
// Format Image Size
// =========================================================

export function formatImageSize(
    bytes
) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return '0 KB';

    }


    const kb =
        bytes / 1024;


    if (
        kb < 1024
    ) {

        return `${Math.round(kb)} KB`;

    }


    const mb =
        kb / 1024;


    return `${mb.toFixed(2)} MB`;

}


// =========================================================
// Canvas To Data URL
// =========================================================

function canvasToDataUrl(
    canvas,
    type,
    quality
) {

    return canvas.toDataURL(
        type,
        quality
    );

}


// =========================================================
// Create Canvas
// =========================================================

function createCanvas(
    width,
    height
) {

    const canvas =
        document.createElement(
            'canvas'
        );


    canvas.width =
        Math.max(
            1,
            Math.round(width)
        );


    canvas.height =
        Math.max(
            1,
            Math.round(height)
        );


    return canvas;

}


// =========================================================
// Draw Image Cover
// =========================================================

function drawImageCover(
    context,
    image,
    canvasWidth,
    canvasHeight
) {

    const imageWidth =
        image.naturalWidth ||
        image.width;


    const imageHeight =
        image.naturalHeight ||
        image.height;


    if (
        !imageWidth ||
        !imageHeight
    ) {

        return;

    }


    const imageRatio =
        imageWidth /
        imageHeight;


    const canvasRatio =
        canvasWidth /
        canvasHeight;


    let drawWidth;

    let drawHeight;

    let offsetX;

    let offsetY;


    if (
        imageRatio >
        canvasRatio
    ) {

        drawHeight =
            canvasHeight;


        drawWidth =
            canvasHeight *
            imageRatio;


        offsetX =
            (
                canvasWidth -
                drawWidth
            ) / 2;


        offsetY =
            0;

    } else {

        drawWidth =
            canvasWidth;


        drawHeight =
            canvasWidth /
            imageRatio;


        offsetX =
            0;


        offsetY =
            (
                canvasHeight -
                drawHeight
            ) / 2;

    }


    context.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
    );

}


// =========================================================
// Apply Soft Vignette
// =========================================================

/**
 * ایجاد تیرگی بسیار نرم در گوشه‌ها.
 *
 * مرکز تصویر تقریباً کاملاً روشن و واضح
 * باقی می‌ماند تا چهره تحت تأثیر قرار نگیرد.
 */
function applySoftVignette(
    context,
    width,
    height
) {

    if (
        width <= 0 ||
        height <= 0
    ) {

        return;

    }


    const centerX =
        width / 2;


    const centerY =
        height / 2;


    /*
     * شعاع داخلی:
     * بخش مرکزی که تقریباً دست‌نخورده می‌ماند.
     */

    const innerRadius =
        Math.min(
            width,
            height
        ) * 0.24;


    /*
     * شعاع خارجی:
     * پایان تدریجی افکت.
     */

    const outerRadius =
        Math.sqrt(
            (
                width *
                width
            ) +
            (
                height *
                height
            )
        ) / 2;


    const gradient =
        context.createRadialGradient(

            centerX,
            centerY,
            innerRadius,

            centerX,
            centerY,
            outerRadius

        );


    /*
     * مرکز کاملاً شفاف
     */

    gradient.addColorStop(
        0,
        'rgba(0, 0, 0, 0)'
    );


    /*
     * تا این قسمت تقریباً بدون اثر
     */

    gradient.addColorStop(
        VIGNETTE_START,
        'rgba(0, 0, 0, 0.008)'
    );


    /*
     * تیرگی بسیار کم
     */

    gradient.addColorStop(
        VIGNETTE_MID,
        'rgba(0, 0, 0, 0.035)'
    );


    /*
     * نزدیک لبه‌ها
     */

    gradient.addColorStop(
        VIGNETTE_NEAR_EDGE,
        'rgba(0, 0, 0, 0.09)'
    );


    /*
     * گوشه‌ها
     */

    gradient.addColorStop(
        1,
        `rgba(0, 0, 0, ${VIGNETTE_END_OPACITY})`
    );


    context.save();


    context.fillStyle =
        gradient;


    context.fillRect(
        0,
        0,
        width,
        height
    );


    context.restore();

}


// =========================================================
// Apply Very Soft Edge
// =========================================================

/**
 * Edge effect خیلی ظریف.
 *
 * عمداً بسیار ضعیف است تا چهره نرم نشود.
 */
function applySoftEdge(
    context,
    width,
    height
) {

    if (
        width <= 0 ||
        height <= 0
    ) {

        return;

    }


    const edgeSize =
        Math.max(
            5,
            Math.round(
                Math.min(
                    width,
                    height
                ) * 0.025
            )
        );


    // -----------------------------------------------------
    // Top
    // -----------------------------------------------------

    const top =
        context.createLinearGradient(
            0,
            0,
            0,
            edgeSize
        );


    top.addColorStop(
        0,
        'rgba(0,0,0,0.018)'
    );


    top.addColorStop(
        1,
        'rgba(0,0,0,0)'
    );


    context.save();

    context.fillStyle =
        top;

    context.fillRect(
        0,
        0,
        width,
        edgeSize
    );

    context.restore();


    // -----------------------------------------------------
    // Bottom
    // -----------------------------------------------------

    const bottom =
        context.createLinearGradient(
            0,
            height,
            0,
            height - edgeSize
        );


    bottom.addColorStop(
        0,
        'rgba(0,0,0,0.018)'
    );


    bottom.addColorStop(
        1,
        'rgba(0,0,0,0)'
    );


    context.save();

    context.fillStyle =
        bottom;

    context.fillRect(
        0,
        height - edgeSize,
        width,
        edgeSize
    );

    context.restore();


    // -----------------------------------------------------
    // Left
    // -----------------------------------------------------

    const left =
        context.createLinearGradient(
            0,
            0,
            edgeSize,
            0
        );


    left.addColorStop(
        0,
        'rgba(0,0,0,0.015)'
    );


    left.addColorStop(
        1,
        'rgba(0,0,0,0)'
    );


    context.save();

    context.fillStyle =
        left;

    context.fillRect(
        0,
        0,
        edgeSize,
        height
    );

    context.restore();


    // -----------------------------------------------------
    // Right
    // -----------------------------------------------------

    const right =
        context.createLinearGradient(
            width,
            0,
            width - edgeSize,
            0
        );


    right.addColorStop(
        0,
        'rgba(0,0,0,0.015)'
    );


    right.addColorStop(
        1,
        'rgba(0,0,0,0)'
    );


    context.save();

    context.fillStyle =
        right;

    context.fillRect(
        width - edgeSize,
        0,
        edgeSize,
        height
    );

    context.restore();

}


// =========================================================
// Render Cropped Image
// =========================================================

export async function renderCroppedProfileImage(
    source,
    cropArea,
    options = {}
) {

    const {

        outputSize =
            CROP_OUTPUT_DIMENSION,

        applyVignette:
            shouldApplyVignette =
                true,

        applyEdgeEffect:
            shouldApplyEdgeEffect =
                true,

    } = options;


    try {

        // ---------------------------------------------------
        // Load Source
        // ---------------------------------------------------

        let image;


        if (
            (
                typeof File !==
                    'undefined' &&
                source instanceof File
            ) ||
            (
                typeof Blob !==
                    'undefined' &&
                source instanceof Blob
            )
        ) {

            image =
                await loadImage(
                    source
                );

        } else if (
            typeof source ===
            'string'
        ) {

            image =
                await loadImageFromDataUrl(
                    source
                );

        } else if (
            typeof HTMLImageElement !==
                'undefined' &&
            source instanceof
                HTMLImageElement
        ) {

            image =
                source;

        } else {

            return {

                success:
                    false,

                message:
                    'منبع تصویر معتبر نیست.',

            };

        }


        // ---------------------------------------------------
        // Source Dimensions
        // ---------------------------------------------------

        const imageWidth =
            image.naturalWidth ||
            image.width;


        const imageHeight =
            image.naturalHeight ||
            image.height;


        // ---------------------------------------------------
        // Normalize Crop
        // ---------------------------------------------------

        const safeCrop =
            normalizeCropArea(

                cropArea,

                imageWidth,

                imageHeight

            );


        if (
            safeCrop.width <= 0 ||
            safeCrop.height <= 0
        ) {

            return {

                success:
                    false,

                message:
                    'ناحیه برش تصویر معتبر نیست.',

            };

        }


        // ---------------------------------------------------
        // Canvas
        // ---------------------------------------------------

        const canvas =
            createCanvas(
                outputSize,
                outputSize
            );


        const context =
            canvas.getContext(
                '2d'
            );


        if (!context) {

            return {

                success:
                    false,

                message:
                    'امکان پردازش تصویر در مرورگر وجود ندارد.',

            };

        }


        // ---------------------------------------------------
        // High Quality Rendering
        // ---------------------------------------------------

        context.imageSmoothingEnabled =
            true;


        context.imageSmoothingQuality =
            'high';


        // ---------------------------------------------------
        // Base Background
        // ---------------------------------------------------

        context.fillStyle =
            '#ffffff';


        context.fillRect(
            0,
            0,
            outputSize,
            outputSize
        );


        // ---------------------------------------------------
        // Draw Exact Crop
        // ---------------------------------------------------

        context.drawImage(

            image,

            safeCrop.x,
            safeCrop.y,

            safeCrop.width,
            safeCrop.height,

            0,
            0,

            outputSize,
            outputSize

        );


        // ---------------------------------------------------
        // Soft Edge
        // ---------------------------------------------------

        if (
            shouldApplyEdgeEffect
        ) {

            applySoftEdge(
                context,
                outputSize,
                outputSize
            );

        }


        // ---------------------------------------------------
        // Main Vignette
        // ---------------------------------------------------

        if (
            shouldApplyVignette
        ) {

            applySoftVignette(
                context,
                outputSize,
                outputSize
            );

        }


        return {

            success:
                true,

            canvas,

            width:
                outputSize,

            height:
                outputSize,

        };

    } catch (error) {

        console.error(
            'Crop Render Error:',
            error
        );


        return {

            success:
                false,

            message:
                'برش تصویر انجام نشد. لطفاً دوباره تلاش کنید.',

        };

    }

}


// =========================================================
// Compress Canvas
// =========================================================

async function compressCanvas(
    canvas,
    options = {}
) {

    const {

        maxSize =
            MAX_OUTPUT_SIZE,

        preferredType =
            'image/webp',

    } = options;


    // -----------------------------------------------------
    // WebP
    // -----------------------------------------------------

    let outputType =
        preferredType;


    let dataUrl =
        canvasToDataUrl(
            canvas,
            outputType,
            0.84
        );


    // -----------------------------------------------------
    // JPEG Fallback
    // -----------------------------------------------------

    if (
        !dataUrl.startsWith(
            'data:image/webp'
        )
    ) {

        outputType =
            'image/jpeg';


        dataUrl =
            canvasToDataUrl(
                canvas,
                outputType,
                0.84
            );

    }


    let currentSize =
        dataUrlToBytes(
            dataUrl
        );


    // -----------------------------------------------------
    // First Result Is Good
    // -----------------------------------------------------

    if (
        currentSize <=
        maxSize
    ) {

        return {

            dataUrl,

            size:
                currentSize,

            type:
                outputType,

        };

    }


    // -----------------------------------------------------
    // Quality Reduction
    // -----------------------------------------------------

    const qualityLevels = [

        0.80,
        0.76,
        0.72,
        0.68,
        0.64,
        0.60,
        0.56,
        0.52,
        0.48,
        0.44,
        0.40,

    ];


    for (
        const quality of
        qualityLevels
    ) {

        dataUrl =
            canvasToDataUrl(
                canvas,
                outputType,
                quality
            );


        currentSize =
            dataUrlToBytes(
                dataUrl
            );


        if (
            currentSize <=
            maxSize
        ) {

            return {

                dataUrl,

                size:
                    currentSize,

                type:
                    outputType,

            };

        }

    }


    // -----------------------------------------------------
    // Return Smallest Available
    // -----------------------------------------------------

    return {

        dataUrl,

        size:
            currentSize,

        type:
            outputType,

    };

}


// =========================================================
// Compress Profile Image
// =========================================================

/**
 * فشرده‌سازی تصویر پروفایل.
 *
 * حالت معمول:
 *
 * compressProfileImage(file)
 *
 * حالت Crop:
 *
 * compressProfileImage(
 *     file,
 *     {
 *         x,
 *         y,
 *         width,
 *         height
 *     }
 * )
 */
export async function compressProfileImage(
    file,
    cropArea = null
) {

    // -----------------------------------------------------
    // Validation
    // -----------------------------------------------------

    const validation =
        validateImageFile(
            file
        );


    if (
        !validation.valid
    ) {

        return {

            success:
                false,

            message:
                validation.message,

        };

    }


    try {

        // ---------------------------------------------------
        // Load
        // ---------------------------------------------------

        const image =
            await loadImage(
                file
            );


        const imageWidth =
            image.naturalWidth ||
            image.width;


        const imageHeight =
            image.naturalHeight ||
            image.height;


        let canvas;

        let finalWidth;

        let finalHeight;


        // ===================================================
        // Crop Mode
        // ===================================================

        if (
            cropArea
        ) {

            const cropped =
                await renderCroppedProfileImage(
                    image,
                    cropArea,
                    {
                        outputSize:
                            CROP_OUTPUT_DIMENSION,

                        applyVignette:
                            true,

                        applyEdgeEffect:
                            true,
                    }
                );


            if (
                !cropped.success
            ) {

                return cropped;

            }


            canvas =
                cropped.canvas;


            finalWidth =
                cropped.width;


            finalHeight =
                cropped.height;

        }


        // ===================================================
        // Normal Mode
        // ===================================================

        else {

            const dimensions =
                calculateDimensions(
                    imageWidth,
                    imageHeight,
                    MAX_DIMENSION
                );


            canvas =
                createCanvas(
                    dimensions.width,
                    dimensions.height
                );


            finalWidth =
                dimensions.width;


            finalHeight =
                dimensions.height;


            const context =
                canvas.getContext(
                    '2d'
                );


            if (!context) {

                return {

                    success:
                        false,

                    message:
                        'امکان پردازش تصویر در مرورگر وجود ندارد.',

                };

            }


            context.imageSmoothingEnabled =
                true;


            context.imageSmoothingQuality =
                'high';


            /*
             * سفید برای PNGهای شفاف.
             */

            context.fillStyle =
                '#ffffff';


            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            /*
             * تصویر اصلی
             */

            context.drawImage(
                image,
                0,
                0,
                dimensions.width,
                dimensions.height
            );


            /*
             * Vignette ظریف
             */

            applySoftVignette(
                context,
                canvas.width,
                canvas.height
            );


            /*
             * Edge بسیار نرم
             */

            applySoftEdge(
                context,
                canvas.width,
                canvas.height
            );

        }


        // ===================================================
        // Compression
        // ===================================================

        let compressed =
            await compressCanvas(
                canvas,
                {
                    maxSize:
                        MAX_OUTPUT_SIZE,

                    preferredType:
                        'image/webp',
                }
            );


        // ===================================================
        // Second Pass
        // ===================================================

        if (
            compressed.size >
            MAX_OUTPUT_SIZE
        ) {

            const fallbackSize =
                Math.min(
                    FALLBACK_CROP_DIMENSION,
                    finalWidth,
                    finalHeight
                );


            /*
             * اگر قبلاً 256×256 بوده،
             * به 192×192 کاهش پیدا می‌کند.
             */

            const fallbackCanvas =
                createCanvas(
                    fallbackSize,
                    fallbackSize
                );


            const fallbackContext =
                fallbackCanvas.getContext(
                    '2d'
                );


            if (!fallbackContext) {

                return {

                    success:
                        false,

                    message:
                        'امکان فشرده‌سازی تصویر وجود ندارد.',

                };

            }


            fallbackContext.imageSmoothingEnabled =
                true;


            fallbackContext.imageSmoothingQuality =
                'high';


            const compressedImage =
                await loadImageFromDataUrl(
                    compressed.dataUrl
                );


            drawImageCover(
                fallbackContext,
                compressedImage,
                fallbackSize,
                fallbackSize
            );


            /*
             * Vignette دوباره، ولی بسیار ملایم.
             */

            applySoftVignette(
                fallbackContext,
                fallbackSize,
                fallbackSize
            );


            compressed =
                await compressCanvas(
                    fallbackCanvas,
                    {
                        maxSize:
                            MAX_OUTPUT_SIZE,

                        preferredType:
                            'image/webp',
                    }
                );


            finalWidth =
                fallbackSize;


            finalHeight =
                fallbackSize;

        }


        // ===================================================
        // Final Validation
        // ===================================================

        const finalSize =
            compressed.size;


        if (
            finalSize >
            MAX_OUTPUT_SIZE
        ) {

            return {

                success:
                    false,

                message:
                    'این عکس بعد از فشرده‌سازی هنوز حجم زیادی دارد. لطفاً عکس دیگری با حجم کمتر انتخاب کنید.',

            };

        }


        // ===================================================
        // Success
        // ===================================================

        return {

            success:
                true,

            dataUrl:
                compressed.dataUrl,

            size:
                finalSize,

            width:
                finalWidth,

            height:
                finalHeight,

            type:
                compressed.type,

        };

    } catch (error) {

        console.error(
            'Profile Image Compression Error:',
            error
        );


        return {

            success:
                false,

            message:
                'پردازش عکس انجام نشد. لطفاً دوباره تلاش کنید.',

        };

    }

}


// =========================================================
// Crop + Compress
// =========================================================

export async function cropAndCompressProfileImage(
    file,
    cropArea
) {

    return compressProfileImage(
        file,
        cropArea
    );

}


// =========================================================
// Get Max Input Size
// =========================================================

export function getMaxImageInputSize() {

    return MAX_INPUT_SIZE;

}


// =========================================================
// Get Max Output Size
// =========================================================

export function getMaxProfileImageSize() {

    return MAX_OUTPUT_SIZE;

}


// =========================================================
// Get Max Image Dimension
// =========================================================

export function getMaxProfileImageDimension() {

    return MAX_DIMENSION;

}


// =========================================================
// Get Crop Output Dimension
// =========================================================

export function getProfileCropDimension() {

    return CROP_OUTPUT_DIMENSION;

}