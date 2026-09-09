import {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    createPortal,
} from 'react-dom';

import {
    Camera,
    Check,
    Crop,
    ImagePlus,
    LoaderCircle,
    Mail,
    Minus,
    Move,
    Plus,
    Save,
    Trash2,
    Upload,
    UserRound,
    X,
} from 'lucide-react';

import {
    useAuth,
} from '../../context/AuthContext';

import {
    compressProfileImage,
    formatImageSize,
} from '../../utils/imageUtils';


// =========================================================
// Constants
// =========================================================

const CROP_BOX_SIZE = 320;

const MIN_ZOOM = 1;

const MAX_ZOOM = 3;

const ZOOM_STEP = 0.1;


// =========================================================
// Reusable Styles
// =========================================================

const ICON_BUTTON_CLASS = `
    flex
    h-10
    w-10
    shrink-0
    items-center
    justify-center
    rounded-xl
    border
    border-[var(--border-subtle)]
    bg-[var(--surface-muted)]
    text-[var(--text-soft)]
    transition-all
    duration-200
    hover:border-[var(--accent-border)]
    hover:bg-[var(--accent-soft)]
    hover:text-[var(--accent-500)]
    disabled:cursor-not-allowed
    disabled:opacity-40
`;

const SECONDARY_BUTTON_CLASS = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-[var(--border-subtle)]
    bg-[var(--surface-muted)]
    px-4
    py-2.5
    text-sm
    font-medium
    text-[var(--text-secondary)]
    transition-all
    duration-200
    hover:border-[var(--accent-border)]
    hover:bg-[var(--accent-soft)]
    hover:text-[var(--accent-600)]
    disabled:cursor-not-allowed
    disabled:opacity-50
`;

const PRIMARY_BUTTON_CLASS = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-[var(--accent-500)]
    px-5
    py-2.5
    text-sm
    font-medium
    text-white
    shadow-[var(--shadow-accent)]
    transition-all
    duration-200
    hover:bg-[var(--accent-600)]
    hover:-translate-y-px
    disabled:cursor-not-allowed
    disabled:opacity-50
`;

const INPUT_CLASS = `
    h-12
    w-full
    rounded-xl
    border
    border-[var(--input-border)]
    bg-[var(--input-bg)]
    px-4
    text-sm
    text-[var(--text)]
    outline-none
    transition-all
    duration-200
    placeholder:text-[var(--text-soft)]
    focus:border-[var(--accent-border-hover)]
    focus:bg-[var(--input-bg-focus)]
    focus:ring-4
    focus:ring-[var(--accent-soft)]
    disabled:cursor-not-allowed
    disabled:opacity-60
`;

const SECTION_CLASS = `
    relative
    overflow-hidden
    rounded-3xl
    border
    border-[var(--border-subtle)]
    bg-[var(--surface-elevated)]
    p-4
    sm:p-5
`;


// =========================================================
// Profile Modal
// =========================================================

export default function ProfileModal({
    isOpen,
    onClose,
}) {

    const {
        user,
        getAccount,
        updateAccount,
        removeProfileAvatar,
    } = useAuth();


    // =====================================================
    // Refs
    // =====================================================

    const fileInputRef =
        useRef(null);

    const modalRef =
        useRef(null);

    const cropAreaRef =
        useRef(null);

    const cropImageRef =
        useRef(null);


    // =====================================================
    // Account State
    // =====================================================

    const [
        name,
        setName,
    ] = useState('');

    const [
        email,
        setEmail,
    ] = useState('');

    const [
        currentAvatar,
        setCurrentAvatar,
    ] = useState('');

    const [
        previewAvatar,
        setPreviewAvatar,
    ] = useState('');


    // =====================================================
    // Image State
    // =====================================================

    const [
        selectedFile,
        setSelectedFile,
    ] = useState(null);

    const [
        compressedSize,
        setCompressedSize,
    ] = useState(0);


    // =====================================================
    // Crop State
    // =====================================================

    const [
        cropFile,
        setCropFile,
    ] = useState(null);

    const [
        cropSource,
        setCropSource,
    ] = useState('');

    const [
        cropImageSize,
        setCropImageSize,
    ] = useState({
        width: 0,
        height: 0,
    });

    const [
        cropZoom,
        setCropZoom,
    ] = useState(MIN_ZOOM);

    const [
        cropPosition,
        setCropPosition,
    ] = useState({
        x: 0,
        y: 0,
    });

    const [
        isCropOpen,
        setIsCropOpen,
    ] = useState(false);

    const [
        isDraggingCrop,
        setIsDraggingCrop,
    ] = useState(false);

    const [
        cropDragStart,
        setCropDragStart,
    ] = useState({
        x: 0,
        y: 0,
        imageX: 0,
        imageY: 0,
    });


    // =====================================================
    // UI State
    // =====================================================

    const [
        error,
        setError,
    ] = useState('');

    const [
        success,
        setSuccess,
    ] = useState('');

    const [
        isProcessing,
        setIsProcessing,
    ] = useState(false);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        isDraggingFile,
        setIsDraggingFile,
    ] = useState(false);


    // =====================================================
    // Helpers
    // =====================================================

    const clamp = (
        value,
        min,
        max
    ) => (
        Math.min(
            Math.max(
                value,
                min
            ),
            max
        )
    );


    // =====================================================
    // Reset Crop
    // =====================================================

    const resetCrop = () => {

        setCropFile(null);

        setCropSource('');

        setCropImageSize({
            width: 0,
            height: 0,
        });

        setCropZoom(
            MIN_ZOOM
        );

        setCropPosition({
            x: 0,
            y: 0,
        });

        setIsCropOpen(false);

        setIsDraggingCrop(false);

    };


    // =====================================================
    // Crop Display Dimensions
    // =====================================================

    const getCropDisplayDimensions = (
        zoom = cropZoom
    ) => {

        if (
            !cropImageSize.width ||
            !cropImageSize.height
        ) {

            return {
                width: 0,
                height: 0,
                scale: 0,
            };

        }


        const baseScale =
            Math.max(
                CROP_BOX_SIZE /
                    cropImageSize.width,

                CROP_BOX_SIZE /
                    cropImageSize.height
            );


        const scale =
            baseScale * zoom;


        return {

            width:
                cropImageSize.width *
                scale,

            height:
                cropImageSize.height *
                scale,

            scale,

        };

    };


    // =====================================================
    // Clamp Crop Position
    // =====================================================

    const clampCropPosition = (
        x,
        y,
        zoom = cropZoom
    ) => {

        const dimensions =
            getCropDisplayDimensions(
                zoom
            );


        if (
            !dimensions.width ||
            !dimensions.height
        ) {

            return {
                x: 0,
                y: 0,
            };

        }


        return {

            x:
                clamp(
                    x,
                    CROP_BOX_SIZE -
                        dimensions.width,
                    0
                ),

            y:
                clamp(
                    y,
                    CROP_BOX_SIZE -
                        dimensions.height,
                    0
                ),

        };

    };


    // =====================================================
    // Center Crop
    // =====================================================

    const getCenteredCropPosition = (
        zoom = MIN_ZOOM
    ) => {

        const dimensions =
            getCropDisplayDimensions(
                zoom
            );


        if (
            !dimensions.width ||
            !dimensions.height
        ) {

            return {
                x: 0,
                y: 0,
            };

        }


        return {

            x:
                (
                    CROP_BOX_SIZE -
                    dimensions.width
                ) / 2,

            y:
                (
                    CROP_BOX_SIZE -
                    dimensions.height
                ) / 2,

        };

    };


    // =====================================================
    // Load Account
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const account =
            getAccount();


        setName(
            account?.name || ''
        );

        setEmail(
            account?.email || ''
        );

        setCurrentAvatar(
            account?.avatar || ''
        );

        setPreviewAvatar(
            account?.avatar || ''
        );

        setSelectedFile(null);

        setCompressedSize(0);

        resetCrop();

        setError('');

        setSuccess('');

        setIsProcessing(false);

        setIsSaving(false);

        setIsDraggingFile(false);

    }, [
        isOpen,
        getAccount,
    ]);


    // =====================================================
    // Sync Account
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        if (
            !isSaving &&
            !isProcessing
        ) {

            if (
                typeof user?.name ===
                'string'
            ) {

                setName(
                    user.name
                );

            }


            if (
                typeof user?.email ===
                'string'
            ) {

                setEmail(
                    user.email
                );

            }

        }

    }, [
        user?.name,
        user?.email,
        isOpen,
        isSaving,
        isProcessing,
    ]);


    // =====================================================
    // Sync Avatar
    // =====================================================

    useEffect(() => {

        if (
            !isOpen ||
            selectedFile ||
            isCropOpen
        ) {

            return;

        }


        const avatar =
            user?.avatar || '';


        setCurrentAvatar(
            avatar
        );

        setPreviewAvatar(
            avatar
        );

    }, [
        user?.avatar,
        isOpen,
        selectedFile,
        isCropOpen,
    ]);


    // =====================================================
    // Escape
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const handleKeyDown = (
            event
        ) => {

            if (
                event.key !==
                'Escape'
            ) {

                return;

            }


            if (isCropOpen) {

                closeCropEditor();

                return;

            }


            if (
                !isProcessing &&
                !isSaving
            ) {

                onClose();

            }

        };


        document.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                'keydown',
                handleKeyDown
            );

        };

    }, [
        isOpen,
        isCropOpen,
        isProcessing,
        isSaving,
        onClose,
    ]);


    // =====================================================
    // Body Scroll Lock
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const previousOverflow =
            document.body.style.overflow;


        document.body.style.overflow =
            'hidden';


        return () => {

            document.body.style.overflow =
                previousOverflow;

        };

    }, [
        isOpen,
    ]);


    // =====================================================
    // File Picker
    // =====================================================

    const openFilePicker = () => {

        if (
            isProcessing ||
            isSaving ||
            isCropOpen
        ) {

            return;

        }


        fileInputRef.current?.click();

    };


    // =====================================================
    // Prepare Image
    // =====================================================

    const prepareFileForCrop = (
        file
    ) => (
        new Promise(
            (
                resolve,
                reject
            ) => {

                const reader =
                    new FileReader();


                reader.onload = () => {

                    const source =
                        reader.result;


                    const image =
                        new Image();


                    image.onload = () => {

                        resolve({

                            source,

                            width:
                                image.naturalWidth ||
                                image.width,

                            height:
                                image.naturalHeight ||
                                image.height,

                        });

                    };


                    image.onerror = () => {

                        reject(
                            new Error(
                                'خواندن تصویر امکان‌پذیر نیست.'
                            )
                        );

                    };


                    image.src =
                        source;

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
        )
    );


    // =====================================================
    // Handle File
    // =====================================================

    const handleFile = async (
        file
    ) => {

        if (!file) {
            return;
        }


        setError('');

        setSuccess('');

        setIsProcessing(true);


        try {

            const prepared =
                await prepareFileForCrop(
                    file
                );


            setCropFile(
                file
            );

            setCropSource(
                prepared.source
            );

            setCropImageSize({

                width:
                    prepared.width,

                height:
                    prepared.height,

            });


            setCropZoom(
                MIN_ZOOM
            );

            setCropPosition({
                x: 0,
                y: 0,
            });

            setIsCropOpen(true);

        } catch (fileError) {

            console.error(
                'Crop Preparation Error:',
                fileError
            );


            setError(
                fileError?.message ||
                'آماده‌سازی تصویر انجام نشد. لطفاً دوباره تلاش کنید.'
            );

        } finally {

            setIsProcessing(false);

        }

    };


    // =====================================================
    // Center Crop After Load
    // =====================================================

    useEffect(() => {

        if (
            !isCropOpen ||
            !cropImageSize.width ||
            !cropImageSize.height
        ) {

            return;

        }


        setCropPosition(
            getCenteredCropPosition(
                cropZoom
            )
        );

    }, [
        isCropOpen,
        cropImageSize.width,
        cropImageSize.height,
    ]);


    // =====================================================
    // File Input
    // =====================================================

    const handleFileChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (file) {

            handleFile(
                file
            );

        }


        event.target.value = '';

    };


    // =====================================================
    // Drag & Drop
    // =====================================================

    const handleFileDragOver = (
        event
    ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
            isProcessing ||
            isSaving ||
            isCropOpen
        ) {

            return;

        }


        setIsDraggingFile(
            true
        );

    };


    const handleFileDragLeave = (
        event
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setIsDraggingFile(
            false
        );

    };


    const handleFileDrop = (
        event
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setIsDraggingFile(
            false
        );


        if (
            isProcessing ||
            isSaving ||
            isCropOpen
        ) {

            return;

        }


        const file =
            event.dataTransfer
                .files?.[0];


        if (file) {

            handleFile(
                file
            );

        }

    };


    // =====================================================
    // Crop Pointer Down
    // =====================================================

    const handleCropPointerDown = (
        event
    ) => {

        if (
            isProcessing ||
            isSaving
        ) {

            return;

        }


        event.preventDefault();


        setIsDraggingCrop(
            true
        );


        setCropDragStart({

            x:
                event.clientX,

            y:
                event.clientY,

            imageX:
                cropPosition.x,

            imageY:
                cropPosition.y,

        });


        try {

            event.currentTarget
                .setPointerCapture(
                    event.pointerId
                );

        } catch {
            // Pointer capture is optional.
        }

    };


    // =====================================================
    // Crop Pointer Move
    // =====================================================

    const handleCropPointerMove = (
        event
    ) => {

        if (!isDraggingCrop) {
            return;
        }


        event.preventDefault();


        const nextPosition =
            clampCropPosition(

                cropDragStart.imageX +
                event.clientX -
                cropDragStart.x,

                cropDragStart.imageY +
                event.clientY -
                cropDragStart.y,

                cropZoom

            );


        setCropPosition(
            nextPosition
        );

    };


    // =====================================================
    // Crop Pointer Up
    // =====================================================

    const handleCropPointerUp = (
        event
    ) => {

        setIsDraggingCrop(
            false
        );


        try {

            event.currentTarget
                .releasePointerCapture(
                    event.pointerId
                );

        } catch {
            // Ignore.
        }

    };


    // =====================================================
    // Zoom
    // =====================================================

    const updateZoom = (
        nextZoom
    ) => {

        const safeZoom =
            clamp(
                Number(
                    nextZoom.toFixed(2)
                ),
                MIN_ZOOM,
                MAX_ZOOM
            );


        const oldDimensions =
            getCropDisplayDimensions(
                cropZoom
            );


        const oldCenterX =
            cropPosition.x +
            oldDimensions.width / 2;


        const oldCenterY =
            cropPosition.y +
            oldDimensions.height / 2;


        const newDimensions =
            getCropDisplayDimensions(
                safeZoom
            );


        let nextX =
            CROP_BOX_SIZE / 2 -
            (
                oldCenterX /
                CROP_BOX_SIZE
            ) *
            newDimensions.width;


        let nextY =
            CROP_BOX_SIZE / 2 -
            (
                oldCenterY /
                CROP_BOX_SIZE
            ) *
            newDimensions.height;


        if (
            !oldDimensions.width ||
            !oldDimensions.height
        ) {

            nextX =
                (
                    CROP_BOX_SIZE -
                    newDimensions.width
                ) / 2;


            nextY =
                (
                    CROP_BOX_SIZE -
                    newDimensions.height
                ) / 2;

        }


        setCropZoom(
            safeZoom
        );


        setCropPosition(
            clampCropPosition(
                nextX,
                nextY,
                safeZoom
            )
        );

    };


    const zoomIn = () => {

        updateZoom(
            cropZoom +
            ZOOM_STEP
        );

    };


    const zoomOut = () => {

        updateZoom(
            cropZoom -
            ZOOM_STEP
        );

    };


    // =====================================================
    // Source Crop Area
    // =====================================================

    const getSourceCropArea = () => {

        const dimensions =
            getCropDisplayDimensions(
                cropZoom
            );


        if (!dimensions.scale) {

            return null;

        }


        const sourceX =
            -cropPosition.x /
            dimensions.scale;


        const sourceY =
            -cropPosition.y /
            dimensions.scale;


        const sourceSize =
            CROP_BOX_SIZE /
            dimensions.scale;


        return {

            x:
                clamp(
                    sourceX,
                    0,
                    Math.max(
                        0,
                        cropImageSize.width -
                        sourceSize
                    )
                ),

            y:
                clamp(
                    sourceY,
                    0,
                    Math.max(
                        0,
                        cropImageSize.height -
                        sourceSize
                    )
                ),

            width:
                Math.min(
                    sourceSize,
                    cropImageSize.width
                ),

            height:
                Math.min(
                    sourceSize,
                    cropImageSize.height
                ),

        };

    };


    // =====================================================
    // Confirm Crop
    // =====================================================

    const confirmCrop = async () => {

        if (
            !cropFile ||
            isProcessing ||
            isSaving
        ) {

            return;

        }


        setError('');

        setSuccess('');


        const cropArea =
            getSourceCropArea();


        if (!cropArea) {

            setError(
                'ناحیه برش معتبر نیست. لطفاً دوباره تلاش کنید.'
            );

            return;

        }


        setIsProcessing(true);


        try {

            const result =
                await compressProfileImage(
                    cropFile,
                    cropArea
                );


            if (!result.success) {

                setError(
                    result.message ||
                    'پردازش عکس انجام نشد.'
                );

                return;

            }


            setPreviewAvatar(
                result.dataUrl
            );

            setSelectedFile(
                cropFile
            );

            setCompressedSize(
                result.size
            );


            resetCrop();


            setSuccess(
                'برش عکس با موفقیت انجام شد. برای نهایی شدن، ذخیره تغییرات را بزنید.'
            );

        } catch (cropError) {

            console.error(
                'Crop Processing Error:',
                cropError
            );


            setError(
                'برش و پردازش عکس انجام نشد. لطفاً دوباره تلاش کنید.'
            );

        } finally {

            setIsProcessing(false);

        }

    };


    // =====================================================
    // Close Crop
    // =====================================================

    const closeCropEditor = () => {

        if (isProcessing) {
            return;
        }


        resetCrop();

        setError('');

    };


    // =====================================================
    // Cancel New Image
    // =====================================================

    const cancelNewImage = () => {

        setSelectedFile(
            null
        );

        setCompressedSize(
            0
        );

        setError('');

        setSuccess('');

        setPreviewAvatar(
            currentAvatar
        );

    };


    // =====================================================
    // Remove Avatar
    // =====================================================

    const handleRemoveAvatar = () => {

        if (
            isProcessing ||
            isSaving ||
            isCropOpen
        ) {

            return;

        }


        setError('');

        setSuccess('');

        setIsSaving(true);


        try {

            const result =
                removeProfileAvatar();


            if (!result.success) {

                setError(
                    result.message ||
                    'حذف عکس انجام نشد.'
                );

                return;

            }


            setCurrentAvatar('');

            setPreviewAvatar('');

            setSelectedFile(null);

            setCompressedSize(0);


            setSuccess(
                'عکس پروفایل با موفقیت حذف شد.'
            );

        } catch (removeError) {

            console.error(
                'Remove Avatar Error:',
                removeError
            );


            setError(
                'حذف عکس پروفایل انجام نشد.'
            );

        } finally {

            setIsSaving(false);

        }

    };


    // =====================================================
    // Save Profile
    // =====================================================

    const handleSave = (
        event
    ) => {

        event.preventDefault();


        if (
            isProcessing ||
            isSaving ||
            isCropOpen
        ) {

            return;

        }


        setError('');

        setSuccess('');

        setIsSaving(true);


        try {

            const account =
                getAccount();


            const result =
                updateAccount({

                    name:
                        name.trim(),

                    email:
                        email.trim(),

                    password:
                        account?.password ||
                        '',

                    avatar:
                        selectedFile
                            ? previewAvatar
                            : currentAvatar,

                });


            if (!result.success) {

                setError(
                    result.message ||
                    'ذخیره اطلاعات پروفایل انجام نشد.'
                );

                return;

            }


            setName(
                result.user?.name ||
                name.trim()
            );

            setEmail(
                result.user?.email ||
                email.trim()
            );

            setCurrentAvatar(
                result.user?.avatar ||
                ''
            );

            setPreviewAvatar(
                result.user?.avatar ||
                ''
            );

            setSelectedFile(null);

            setCompressedSize(0);


            setSuccess(
                'اطلاعات پروفایل با موفقیت ذخیره شد.'
            );


            window.setTimeout(
                onClose,
                250
            );

        } catch (saveError) {

            console.error(
                'Profile Save Error:',
                saveError
            );


            setError(
                'ذخیره اطلاعات پروفایل انجام نشد. لطفاً دوباره تلاش کنید.'
            );

        } finally {

            setIsSaving(false);

        }

    };


    // =====================================================
    // Close
    // =====================================================

    const handleClose = () => {

        if (
            isProcessing ||
            isSaving
        ) {

            return;

        }


        if (isCropOpen) {

            closeCropEditor();

            return;

        }


        onClose();

    };


    const handleBackdropClick = (
        event
    ) => {

        if (
            event.target !==
            event.currentTarget
        ) {

            return;

        }


        handleClose();

    };


    // =====================================================
    // Render Data
    // =====================================================

    const hasAvatar =
        Boolean(
            previewAvatar
        );


    const cropDimensions =
        getCropDisplayDimensions(
            cropZoom
        );


    if (!isOpen) {

        return null;

    }


    // =====================================================
    // Modal Content
    // =====================================================

    const modalContent = (

        <>

            {/* =====================================================
                GLOBAL BACKDROP
                Blur the entire application behind the modal.
            ====================================================== */}

            <div
                className="
                    fixed
                    inset-0
                    z-[9998]

                    bg-slate-950/[0.28]
                    dark:bg-black/[0.48]

                    backdrop-blur-[24px]
                    backdrop-saturate-[0.68]

                    animate-[profileBackdropIn_180ms_ease-out]
                "
                aria-hidden="true"
            />


            {/* =====================================================
                MODAL
            ====================================================== */}

            <div
                className="
                    fixed
                    inset-0
                    z-[10000]

                    flex
                    min-h-screen
                    w-screen

                    items-center
                    justify-center

                    overflow-y-auto

                    px-3
                    py-4

                    sm:px-5
                    sm:py-6

                    animate-[profileModalIn_200ms_var(--ease-smooth)]
                "

                onMouseDown={
                    handleBackdropClick
                }
            >

                <div
                    ref={
                        modalRef
                    }

                    dir="rtl"

                    className="
                        relative

                        flex
                        max-h-[calc(100vh-2rem)]

                        w-full
                        max-w-2xl

                        flex-col

                        overflow-hidden

                        rounded-3xl

                        border
                        border-[var(--glass-border)]

                        bg-[var(--surface-elevated)]

                        shadow-[var(--shadow-xl)]

                        supports-[backdrop-filter]:bg-[var(--glass-bg)]

                        supports-[backdrop-filter]:backdrop-blur-[28px]
                        supports-[backdrop-filter]:backdrop-saturate-150

                        sm:max-h-[92vh]
                    "

                    onMouseDown={(
                        event
                    ) =>
                        event.stopPropagation()
                    }
                >

                    {/* =================================================
                        Header
                    ================================================== */}

                    <div
                        className="
                            relative
                            shrink-0
                            overflow-hidden

                            border-b
                            border-[var(--border-subtle)]

                            px-5
                            py-4

                            sm:px-6
                            sm:py-5
                        "
                    >

                        {/* Accent Glow */}

                        <div
                            aria-hidden="true"

                            className="
                                pointer-events-none

                                absolute
                                -right-16
                                -top-20

                                h-40
                                w-40

                                rounded-full

                                bg-[var(--accent-soft-heavy)]

                                blur-3xl
                            "
                        />


                        <div
                            aria-hidden="true"

                            className="
                                pointer-events-none

                                absolute
                                -bottom-20
                                -left-16

                                h-40
                                w-40

                                rounded-full

                                bg-indigo-500/[0.04]
                                dark:bg-indigo-400/[0.05]

                                blur-3xl
                            "
                        />


                        <div
                            className="
                                relative

                                flex
                                items-center
                                justify-between

                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0

                                        items-center
                                        justify-center

                                        rounded-2xl

                                        border
                                        border-[var(--accent-border)]

                                        bg-[var(--accent-soft)]

                                        text-[var(--accent-500)]
                                    "
                                >
                                    <UserRound
                                        size={20}
                                        strokeWidth={1.8}
                                    />
                                </div>


                                <div
                                    className="min-w-0"
                                >

                                    <h2
                                        className="
                                            truncate

                                            text-base
                                            font-semibold

                                            text-[var(--text)]

                                            sm:text-lg
                                        "
                                    >
                                        پروفایل من
                                    </h2>


                                    <p
                                        className="
                                            mt-0.5
                                            truncate

                                            text-xs

                                            text-[var(--text-muted)]

                                            sm:text-sm
                                        "
                                    >
                                        اطلاعات حساب و عکس پروفایل
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"

                                onClick={
                                    handleClose
                                }

                                disabled={
                                    isProcessing ||
                                    isSaving
                                }

                                aria-label="بستن"

                                className={`
                                    ${ICON_BUTTON_CLASS}

                                    border-transparent
                                    bg-transparent

                                    hover:border-[var(--border-subtle)]
                                `}
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        Form
                    ================================================== */}

                    <form
                        onSubmit={
                            handleSave
                        }

                        className="
                            flex
                            min-h-0
                            flex-1
                            flex-col
                        "
                    >

                        {/* =================================================
                            Body
                        ================================================== */}

                        <div
                            className="
                                min-h-0
                                flex-1

                                overflow-y-auto
                                main-scrollbar

                                px-4
                                py-4

                                sm:px-6
                                sm:py-6
                            "
                        >

                            {/* =================================================
                                Error
                            ================================================== */}

                            {error && (

                                <div
                                    className="
                                        mb-4

                                        flex
                                        items-start
                                        gap-3

                                        rounded-2xl

                                        border
                                        border-red-500/20

                                        bg-red-500/10

                                        px-4
                                        py-3

                                        text-sm
                                        text-[var(--danger)]
                                    "
                                >

                                    <span
                                        className="
                                            mt-0.5

                                            flex
                                            h-5
                                            w-5
                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-full

                                            bg-red-500/10

                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        !
                                    </span>


                                    <p
                                        className="
                                            leading-6
                                        "
                                    >
                                        {error}
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                Success
                            ================================================== */}

                            {success && (

                                <div
                                    className="
                                        mb-4

                                        flex
                                        items-start
                                        gap-3

                                        rounded-2xl

                                        border
                                        border-[var(--accent-border)]

                                        bg-[var(--accent-soft)]

                                        px-4
                                        py-3

                                        text-sm
                                        text-[var(--accent-600)]
                                    "
                                >

                                    <span
                                        className="
                                            mt-0.5

                                            flex
                                            h-5
                                            w-5
                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-full

                                            bg-[var(--accent-soft-strong)]
                                        "
                                    >
                                        <Check
                                            size={13}
                                        />
                                    </span>


                                    <p
                                        className="
                                            leading-6
                                        "
                                    >
                                        {success}
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                Profile Photo
                            ================================================== */}

                            <section
                                className={
                                    SECTION_CLASS
                                }
                            >

                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-5

                                        sm:flex-row
                                        sm:items-center
                                    "
                                >

                                    {/* Avatar */}

                                    <div
                                        className="
                                            relative
                                            mx-auto
                                            shrink-0

                                            sm:mx-0
                                        "
                                    >

                                        <div
                                            className="
                                                relative

                                                h-28
                                                w-28

                                                overflow-hidden

                                                rounded-[2rem]

                                                border-4
                                                border-[var(--surface-elevated)]

                                                bg-[var(--surface-muted)]

                                                shadow-[var(--shadow-lg)]

                                                sm:h-32
                                                sm:w-32
                                            "
                                        >

                                            {hasAvatar ? (

                                                <img
                                                    src={
                                                        previewAvatar
                                                    }

                                                    alt={
                                                        user?.name ||
                                                        'پروفایل'
                                                    }

                                                    className="
                                                        h-full
                                                        w-full

                                                        object-cover
                                                    "
                                                />

                                            ) : (

                                                <div
                                                    className="
                                                        flex
                                                        h-full
                                                        w-full

                                                        items-center
                                                        justify-center

                                                        bg-[var(--accent-soft)]

                                                        text-[var(--text-soft)]
                                                    "
                                                >

                                                    <UserRound
                                                        size={46}
                                                        strokeWidth={1.35}
                                                    />

                                                </div>

                                            )}


                                            {isProcessing && (

                                                <div
                                                    className="
                                                        absolute
                                                        inset-0

                                                        flex
                                                        flex-col

                                                        items-center
                                                        justify-center

                                                        gap-2

                                                        bg-black/55

                                                        text-white

                                                        backdrop-blur-sm
                                                    "
                                                >

                                                    <LoaderCircle
                                                        size={27}
                                                        className="animate-spin"
                                                    />


                                                    <span
                                                        className="
                                                            text-[11px]
                                                            font-medium
                                                        "
                                                    >
                                                        در حال پردازش...
                                                    </span>

                                                </div>

                                            )}

                                        </div>


                                        {/* Camera */}

                                        <button
                                            type="button"

                                            onClick={
                                                openFilePicker
                                            }

                                            disabled={
                                                isProcessing ||
                                                isSaving ||
                                                isCropOpen
                                            }

                                            className="
                                                absolute
                                                -bottom-2
                                                -left-2

                                                flex
                                                h-10
                                                w-10

                                                items-center
                                                justify-center

                                                rounded-xl

                                                border
                                                border-[var(--surface-elevated)]

                                                bg-[var(--accent-500)]

                                                text-white

                                                shadow-[var(--shadow-accent)]

                                                transition-all
                                                duration-200

                                                hover:scale-105
                                                hover:bg-[var(--accent-600)]

                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "

                                            title="تغییر عکس"
                                        >

                                            <Camera
                                                size={18}
                                            />

                                        </button>

                                    </div>


                                    {/* Photo Details */}

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <div
                                            className="
                                                mb-3

                                                flex
                                                flex-wrap
                                                items-center

                                                gap-2
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5

                                                    rounded-full

                                                    border
                                                    border-[var(--accent-border)]

                                                    bg-[var(--accent-soft)]

                                                    px-3
                                                    py-1

                                                    text-xs
                                                    font-medium

                                                    text-[var(--accent-600)]
                                                "
                                            >

                                                <ImagePlus
                                                    size={13}
                                                />

                                                عکس پروفایل

                                            </span>


                                            <span
                                                className="
                                                    rounded-full

                                                    border
                                                    border-[var(--border-subtle)]

                                                    bg-[var(--surface-muted)]

                                                    px-3
                                                    py-1

                                                    text-xs

                                                    text-[var(--text-muted)]
                                                "
                                            >
                                                حداکثر ۵ MB
                                            </span>

                                        </div>


                                        <h3
                                            className="
                                                text-base
                                                font-medium

                                                text-[var(--text)]
                                            "
                                        >
                                            عکس مدیر فروشگاه
                                        </h3>


                                        <p
                                            className="
                                                mt-1.5

                                                max-w-lg

                                                text-sm
                                                leading-6

                                                text-[var(--text-muted)]
                                            "
                                        >
                                            ابتدا عکس را انتخاب کنید و سپس
                                            چهره را داخل کادر تنظیم کنید.
                                            سیستم بعد از برش، گوشه‌ها را
                                            کمی نرم و تصویر را فشرده می‌کند.
                                        </p>


                                        <div
                                            className="
                                                mt-4

                                                flex
                                                flex-wrap

                                                gap-2
                                            "
                                        >

                                            <button
                                                type="button"

                                                onClick={
                                                    openFilePicker
                                                }

                                                disabled={
                                                    isProcessing ||
                                                    isSaving ||
                                                    isCropOpen
                                                }

                                                className={
                                                    PRIMARY_BUTTON_CLASS
                                                }
                                            >

                                                <Upload
                                                    size={17}
                                                />

                                                انتخاب عکس

                                            </button>


                                            {selectedFile && (

                                                <button
                                                    type="button"

                                                    onClick={
                                                        cancelNewImage
                                                    }

                                                    disabled={
                                                        isProcessing ||
                                                        isSaving ||
                                                        isCropOpen
                                                    }

                                                    className={
                                                        SECONDARY_BUTTON_CLASS
                                                    }
                                                >

                                                    <X
                                                        size={16}
                                                    />

                                                    لغو عکس جدید

                                                </button>

                                            )}


                                            {currentAvatar &&
                                                !selectedFile && (

                                                <button
                                                    type="button"

                                                    onClick={
                                                        handleRemoveAvatar
                                                    }

                                                    disabled={
                                                        isProcessing ||
                                                        isSaving ||
                                                        isCropOpen
                                                    }

                                                    className="
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        gap-2

                                                        rounded-xl

                                                        border
                                                        border-red-500/10

                                                        bg-red-500/[0.06]

                                                        px-4
                                                        py-2.5

                                                        text-sm
                                                        font-medium

                                                        text-[var(--danger)]

                                                        transition-all
                                                        duration-200

                                                        hover:border-red-500/20
                                                        hover:bg-red-500/10

                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                    حذف عکس

                                                </button>

                                            )}

                                        </div>


                                        {selectedFile && (

                                            <div
                                                className="
                                                    mt-4

                                                    flex
                                                    flex-wrap
                                                    items-center

                                                    gap-2

                                                    text-xs

                                                    text-[var(--text-muted)]
                                                "
                                            >

                                                <span
                                                    className="
                                                        max-w-full
                                                        truncate
                                                    "
                                                >
                                                    {
                                                        selectedFile.name
                                                    }
                                                </span>


                                                <span>
                                                    •
                                                </span>


                                                <span
                                                    className="
                                                        font-medium

                                                        text-[var(--accent-600)]
                                                    "
                                                >
                                                    حجم نهایی:{' '}
                                                    {formatImageSize(
                                                        compressedSize
                                                    )}
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* =================================================
                                    Drop Zone
                                ================================================== */}

                                <div
                                    onDragOver={
                                        handleFileDragOver
                                    }

                                    onDragLeave={
                                        handleFileDragLeave
                                    }

                                    onDrop={
                                        handleFileDrop
                                    }

                                    onClick={
                                        openFilePicker
                                    }

                                    className={`
                                        mt-5

                                        flex
                                        min-h-28

                                        cursor-pointer

                                        flex-col
                                        items-center
                                        justify-center

                                        rounded-2xl

                                        border-2
                                        border-dashed

                                        px-5
                                        py-5

                                        text-center

                                        transition-all
                                        duration-200

                                        ${
                                            isDraggingFile
                                                ? `
                                                    border-[var(--accent-500)]

                                                    bg-[var(--accent-soft)]
                                                `
                                                : `
                                                    border-[var(--border-subtle)]

                                                    bg-[var(--surface-muted)]

                                                    hover:border-[var(--accent-border-hover)]

                                                    hover:bg-[var(--accent-soft)]
                                                `
                                        }
                                    `}
                                >

                                    <div
                                        className="
                                            mb-2

                                            flex
                                            h-10
                                            w-10

                                            items-center
                                            justify-center

                                            rounded-xl

                                            bg-[var(--surface)]

                                            text-[var(--text-soft)]
                                        "
                                    >

                                        <ImagePlus
                                            size={20}
                                        />

                                    </div>


                                    <p
                                        className="
                                            text-sm
                                            font-medium

                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        عکس را اینجا رها کنید
                                    </p>


                                    <p
                                        className="
                                            mt-1

                                            text-xs

                                            text-[var(--text-muted)]
                                        "
                                    >
                                        یا برای انتخاب از کامپیوتر کلیک کنید
                                    </p>

                                </div>


                                {/* Hidden File Input */}

                                <input
                                    ref={
                                        fileInputRef
                                    }

                                    type="file"

                                    accept="
                                        image/jpeg,
                                        image/jpg,
                                        image/png,
                                        image/webp
                                    "

                                    onChange={
                                        handleFileChange
                                    }

                                    className="hidden"
                                />

                            </section>


                            {/* =================================================
                                Account
                            ================================================== */}

                            <section
                                className={`
                                    ${SECTION_CLASS}
                                    mt-5
                                `}
                            >

                                <div
                                    className="
                                        mb-5

                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-xl

                                            border
                                            border-indigo-500/10

                                            bg-indigo-500/[0.07]
                                            dark:bg-indigo-400/[0.08]

                                            text-indigo-500
                                            dark:text-indigo-400
                                        "
                                    >

                                        <UserRound
                                            size={19}
                                        />

                                    </div>


                                    <div
                                        className="min-w-0"
                                    >

                                        <h3
                                            className="
                                                text-base
                                                font-medium

                                                text-[var(--text)]
                                            "
                                        >
                                            اطلاعات حساب
                                        </h3>


                                        <p
                                            className="
                                                mt-0.5

                                                text-xs

                                                text-[var(--text-muted)]
                                            "
                                        >
                                            اطلاعات واقعی حساب مدیر
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-4

                                        sm:grid-cols-2
                                    "
                                >

                                    {/* Name */}

                                    <div>

                                        <label
                                            htmlFor="profile-name"

                                            className="
                                                mb-2
                                                block

                                                text-sm
                                                font-medium

                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            نام مدیر
                                        </label>


                                        <div
                                            className="relative"
                                        >

                                            <UserRound
                                                size={17}

                                                className="
                                                    pointer-events-none

                                                    absolute
                                                    right-3
                                                    top-1/2

                                                    -translate-y-1/2

                                                    text-[var(--text-soft)]
                                                "
                                            />


                                            <input
                                                id="profile-name"

                                                type="text"

                                                value={
                                                    name
                                                }

                                                onChange={(
                                                    event
                                                ) =>
                                                    setName(
                                                        event.target.value
                                                    )
                                                }

                                                disabled={
                                                    isSaving ||
                                                    isProcessing ||
                                                    isCropOpen
                                                }

                                                autoComplete="name"

                                                className={`
                                                    ${INPUT_CLASS}

                                                    pr-10
                                                    pl-4
                                                `}
                                            />

                                        </div>

                                    </div>


                                    {/* Email */}

                                    <div>

                                        <label
                                            htmlFor="profile-email"

                                            className="
                                                mb-2
                                                block

                                                text-sm
                                                font-medium

                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            ایمیل
                                        </label>


                                        <div
                                            className="relative"
                                        >

                                            <Mail
                                                size={17}

                                                className="
                                                    pointer-events-none

                                                    absolute
                                                    right-3
                                                    top-1/2

                                                    -translate-y-1/2

                                                    text-[var(--text-soft)]
                                                "
                                            />


                                            <input
                                                id="profile-email"

                                                type="email"

                                                value={
                                                    email
                                                }

                                                onChange={(
                                                    event
                                                ) =>
                                                    setEmail(
                                                        event.target.value
                                                    )
                                                }

                                                disabled={
                                                    isSaving ||
                                                    isProcessing ||
                                                    isCropOpen
                                                }

                                                dir="ltr"

                                                autoComplete="email"

                                                className={`
                                                    ${INPUT_CLASS}

                                                    pr-10
                                                    pl-4
                                                `}
                                            />

                                        </div>

                                    </div>

                                </div>

                            </section>

                        </div>


                        {/* =================================================
                            Footer
                        ================================================== */}

                        <div
                            className="
                                shrink-0

                                border-t
                                border-[var(--border-subtle)]

                                bg-[var(--surface)]

                                px-4
                                py-4

                                sm:px-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-3

                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <p
                                    className="
                                        text-center

                                        text-[11px]
                                        leading-5

                                        text-[var(--text-soft)]

                                        sm:max-w-sm
                                        sm:text-start
                                    "
                                >
                                    عکس ابتدا برش داده می‌شود و سپس
                                    برای نگهداری بهینه فشرده خواهد شد.
                                </p>


                                <div
                                    className="
                                        flex
                                        w-full
                                        gap-2

                                        sm:w-auto
                                    "
                                >

                                    <button
                                        type="button"

                                        onClick={
                                            handleClose
                                        }

                                        disabled={
                                            isProcessing ||
                                            isSaving
                                        }

                                        className={`
                                            ${SECONDARY_BUTTON_CLASS}

                                            flex-1

                                            sm:flex-none
                                        `}
                                    >
                                        انصراف
                                    </button>


                                    <button
                                        type="submit"

                                        disabled={
                                            isProcessing ||
                                            isSaving ||
                                            isCropOpen
                                        }

                                        className={`
                                            ${PRIMARY_BUTTON_CLASS}

                                            flex-1

                                            sm:flex-none
                                        `}
                                    >

                                        {isSaving ? (

                                            <>

                                                <LoaderCircle
                                                    size={17}
                                                    className="animate-spin"
                                                />

                                                در حال ذخیره...

                                            </>

                                        ) : (

                                            <>

                                                <Save
                                                    size={17}
                                                />

                                                ذخیره تغییرات

                                            </>

                                        )}

                                    </button>

                                </div>

                            </div>

                        </div>

                    </form>


                    {/* =================================================
                        Crop Editor
                    ================================================== */}

                    {isCropOpen && (

                        <div
                            className="
                                absolute
                                inset-0
                                z-50

                                flex
                                flex-col

                                overflow-hidden

                                bg-[#070b14]

                                text-white
                            "
                        >

                            {/* Crop Header */}

                            <div
                                className="
                                    shrink-0

                                    border-b
                                    border-white/10

                                    bg-[#070b14]/96

                                    px-4
                                    py-4

                                    sm:px-6
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between

                                        gap-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0

                                                items-center
                                                justify-center

                                                rounded-xl

                                                bg-[var(--accent-soft-strong)]

                                                text-[var(--accent-400)]
                                            "
                                        >
                                            <Crop
                                                size={20}
                                            />
                                        </div>


                                        <div
                                            className="min-w-0"
                                        >

                                            <h3
                                                className="
                                                    truncate

                                                    text-base
                                                    font-medium

                                                    sm:text-lg
                                                "
                                            >
                                                تنظیم عکس پروفایل
                                            </h3>


                                            <p
                                                className="
                                                    mt-0.5

                                                    truncate

                                                    text-[11px]
                                                    text-slate-400
                                                "
                                            >
                                                چهره را داخل کادر قرار دهید
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"

                                        onClick={
                                            closeCropEditor
                                        }

                                        disabled={
                                            isProcessing
                                        }

                                        className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-xl

                                            text-slate-400

                                            transition-all
                                            duration-200

                                            hover:bg-white/10
                                            hover:text-white

                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "

                                        aria-label="بستن برش"
                                    >

                                        <X
                                            size={20}
                                        />

                                    </button>

                                </div>

                            </div>


                            {/* Crop Area */}

                            <div
                                className="
                                    min-h-0
                                    flex-1

                                    flex
                                    flex-col

                                    items-center
                                    justify-center

                                    gap-5

                                    overflow-y-auto
                                    main-scrollbar

                                    px-4
                                    py-5

                                    sm:gap-6
                                    sm:py-6
                                "
                            >

                                {/* Hint */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2

                                        rounded-full

                                        border
                                        border-white/10

                                        bg-white/5

                                        px-4
                                        py-2

                                        text-[11px]

                                        text-slate-300
                                    "
                                >

                                    <Move
                                        size={14}
                                    />

                                    عکس را بکشید تا چهره
                                    در مرکز قرار بگیرد

                                </div>


                                {/* Crop Viewport */}

                                <div
                                    ref={
                                        cropAreaRef
                                    }

                                    className="
                                        relative

                                        h-[280px]
                                        w-[280px]

                                        shrink-0

                                        overflow-hidden

                                        rounded-[2rem]

                                        border
                                        border-white/15

                                        bg-slate-900

                                        shadow-2xl
                                        shadow-black/50

                                        touch-none
                                        select-none

                                        sm:h-[320px]
                                        sm:w-[320px]
                                    "

                                    style={{
                                        touchAction:
                                            'none',

                                        cursor:
                                            isDraggingCrop
                                                ? 'grabbing'
                                                : 'grab',
                                    }}

                                    onPointerDown={
                                        handleCropPointerDown
                                    }

                                    onPointerMove={
                                        handleCropPointerMove
                                    }

                                    onPointerUp={
                                        handleCropPointerUp
                                    }

                                    onPointerCancel={
                                        handleCropPointerUp
                                    }
                                >

                                    {cropSource && (

                                        <img
                                            ref={
                                                cropImageRef
                                            }

                                            src={
                                                cropSource
                                            }

                                            alt="برش عکس پروفایل"

                                            draggable={
                                                false
                                            }

                                            className="
                                                pointer-events-none

                                                absolute

                                                max-w-none

                                                select-none

                                                object-fill
                                            "

                                            style={{

                                                width:
                                                    cropDimensions.width,

                                                height:
                                                    cropDimensions.height,

                                                left:
                                                    cropPosition.x,

                                                top:
                                                    cropPosition.y,

                                            }}
                                        />

                                    )}


                                    {/* Crop Dark Overlay */}

                                    <div
                                        className="
                                            pointer-events-none
                                            absolute
                                            inset-0
                                        "
                                    >

                                        <div
                                            className="
                                                absolute
                                                inset-x-0
                                                top-0

                                                h-[calc((100%-280px)/2)]

                                                bg-black/45

                                                sm:h-[calc((100%-320px)/2)]
                                            "
                                        />


                                        <div
                                            className="
                                                absolute
                                                inset-x-0
                                                bottom-0

                                                h-[calc((100%-280px)/2)]

                                                bg-black/45

                                                sm:h-[calc((100%-320px)/2)]
                                            "
                                        />


                                        <div
                                            className="
                                                absolute
                                                bottom-0
                                                left-0
                                                top-0

                                                w-[calc((100%-280px)/2)]

                                                bg-black/45

                                                sm:w-[calc((100%-320px)/2)]
                                            "
                                        />


                                        <div
                                            className="
                                                absolute
                                                bottom-0
                                                right-0
                                                top-0

                                                w-[calc((100%-280px)/2)]

                                                bg-black/45

                                                sm:w-[calc((100%-320px)/2)]
                                            "
                                        />

                                    </div>


                                    {/* Crop Frame */}

                                    <div
                                        className="
                                            pointer-events-none

                                            absolute

                                            left-1/2
                                            top-1/2

                                            h-[280px]
                                            w-[280px]

                                            -translate-x-1/2
                                            -translate-y-1/2

                                            rounded-[1.75rem]

                                            border-2
                                            border-white/90

                                            shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]

                                            sm:h-[320px]
                                            sm:w-[320px]
                                        "
                                    >

                                        {[
                                            'left-0 top-0 rounded-tl-xl border-l-4 border-t-4',
                                            'right-0 top-0 rounded-tr-xl border-r-4 border-t-4',
                                            'bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4',
                                            'bottom-0 right-0 rounded-br-xl border-b-4 border-r-4',
                                        ].map(
                                            (
                                                className
                                            ) => (

                                                <span
                                                    key={
                                                        className
                                                    }

                                                    className={`
                                                        absolute

                                                        h-7
                                                        w-7

                                                        border-[var(--accent-400)]

                                                        ${className}
                                                    `}
                                                />

                                            )
                                        )}

                                    </div>


                                    {/* Center Cross */}

                                    <div
                                        className="
                                            pointer-events-none

                                            absolute
                                            left-1/2
                                            top-1/2

                                            flex
                                            -translate-x-1/2
                                            -translate-y-1/2

                                            items-center
                                            justify-center
                                        "
                                    >

                                        <div
                                            className="
                                                h-px
                                                w-10

                                                bg-white/25
                                            "
                                        />


                                        <div
                                            className="
                                                absolute

                                                h-10
                                                w-px

                                                bg-white/25
                                            "
                                        />

                                    </div>

                                </div>


                                {/* Zoom */}

                                <div
                                    className="
                                        w-full
                                        max-w-sm

                                        rounded-2xl

                                        border
                                        border-white/10

                                        bg-white/5

                                        px-4
                                        py-4

                                        backdrop-blur-sm
                                    "
                                >

                                    <div
                                        className="
                                            mb-3

                                            flex
                                            items-center
                                            justify-between
                                        "
                                    >

                                        <span
                                            className="
                                                text-sm
                                                font-medium
                                                text-white
                                            "
                                        >
                                            بزرگنمایی
                                        </span>


                                        <span
                                            className="
                                                rounded-full

                                                border
                                                border-white/10

                                                bg-white/10

                                                px-2.5
                                                py-1

                                                text-xs
                                                font-medium

                                                text-slate-300
                                            "
                                        >
                                            {
                                                Math.round(
                                                    cropZoom *
                                                    100
                                                )
                                            }%
                                        </span>

                                    </div>


                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <button
                                            type="button"

                                            onClick={
                                                zoomOut
                                            }

                                            disabled={
                                                cropZoom <=
                                                MIN_ZOOM
                                            }

                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0

                                                items-center
                                                justify-center

                                                rounded-xl

                                                border
                                                border-white/10

                                                bg-white/10

                                                text-white

                                                transition-all
                                                duration-200

                                                hover:bg-white/15

                                                disabled:cursor-not-allowed
                                                disabled:opacity-30
                                            "
                                        >
                                            <Minus
                                                size={17}
                                            />
                                        </button>


                                        <input
                                            type="range"

                                            min={
                                                MIN_ZOOM
                                            }

                                            max={
                                                MAX_ZOOM
                                            }

                                            step={
                                                ZOOM_STEP
                                            }

                                            value={
                                                cropZoom
                                            }

                                            onChange={(
                                                event
                                            ) =>
                                                updateZoom(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }

                                            className="
                                                h-2
                                                min-w-0
                                                flex-1

                                                cursor-pointer

                                                accent-[var(--accent-500)]
                                            "

                                            aria-label="بزرگنمایی تصویر"
                                        />


                                        <button
                                            type="button"

                                            onClick={
                                                zoomIn
                                            }

                                            disabled={
                                                cropZoom >=
                                                MAX_ZOOM
                                            }

                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0

                                                items-center
                                                justify-center

                                                rounded-xl

                                                border
                                                border-white/10

                                                bg-white/10

                                                text-white

                                                transition-all
                                                duration-200

                                                hover:bg-white/15

                                                disabled:cursor-not-allowed
                                                disabled:opacity-30
                                            "
                                        >
                                            <Plus
                                                size={17}
                                            />
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                Crop Footer
                            ================================================== */}

                            <div
                                className="
                                    shrink-0

                                    border-t
                                    border-white/10

                                    bg-[#070b14]/96

                                    px-4
                                    py-4

                                    sm:px-6
                                "
                            >

                                <div
                                    className="
                                        flex
                                        flex-col-reverse
                                        gap-3

                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                    "
                                >

                                    <p
                                        className="
                                            text-center

                                            text-[11px]
                                            leading-5

                                            text-slate-500

                                            sm:max-w-xs
                                            sm:text-start
                                        "
                                    >
                                        صورت را با حرکت انگشت یا موس
                                        تنظیم کنید و بعد برش را تأیید کنید.
                                    </p>


                                    <div
                                        className="
                                            flex
                                            w-full
                                            gap-2

                                            sm:w-auto
                                        "
                                    >

                                        <button
                                            type="button"

                                            onClick={
                                                closeCropEditor
                                            }

                                            disabled={
                                                isProcessing
                                            }

                                            className="
                                                flex-1

                                                rounded-xl

                                                border
                                                border-white/10

                                                bg-white/5

                                                px-4
                                                py-3

                                                text-sm
                                                font-medium

                                                text-slate-300

                                                transition-all
                                                duration-200

                                                hover:bg-white/10

                                                disabled:cursor-not-allowed
                                                disabled:opacity-40

                                                sm:flex-none
                                            "
                                        >
                                            لغو
                                        </button>


                                        <button
                                            type="button"

                                            onClick={
                                                confirmCrop
                                            }

                                            disabled={
                                                isProcessing ||
                                                !cropSource
                                            }

                                            className="
                                                flex
                                                flex-1

                                                items-center
                                                justify-center

                                                gap-2

                                                rounded-xl

                                                bg-[var(--accent-500)]

                                                px-5
                                                py-3

                                                text-sm
                                                font-medium

                                                text-white

                                                shadow-[var(--shadow-accent)]

                                                transition-all
                                                duration-200

                                                hover:bg-[var(--accent-600)]

                                                disabled:cursor-not-allowed
                                                disabled:opacity-50

                                                sm:flex-none
                                            "
                                        >

                                            {isProcessing ? (

                                                <>

                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />

                                                    در حال پردازش...

                                                </>

                                            ) : (

                                                <>

                                                    <Check
                                                        size={17}
                                                    />

                                                    تأیید برش

                                                </>

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </>

    );


    // =====================================================
    // Portal
    // =====================================================

    return createPortal(
        modalContent,
        document.body
    );

}