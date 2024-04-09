
export const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch(err => next(err));
    }
};

// export const asyncHandler = (functionAny) => async (req,res,next) => {
//     try {
//         await functionAny(req,res,next);
//     } catch(err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//     }
// };