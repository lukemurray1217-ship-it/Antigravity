const EXERCISES = [
    // --- SITTING CATEGORY ---
    {
        id: "seated-neck-release",
        title: "Seated Neck Release",
        category: "Sitting",
        description: "A gentle stretch to relieve tension in the upper trapezius and neck muscles caused by looking down at screens.",
        benefit: "Relieves neck tension and headaches.",
        icon: "🧘",
        illustration: "assets/illustrations/neck-release.png",
        workout: [
            {
                subtitle: "Right Side",
                duration: "30s",
                instruction: "Sit tall. Place your right hand on your left ear and gently guide your head towards your right shoulder.",
                image: "assets/illustrations/steps/neck-release-1.png"
            },
            {
                subtitle: "Left Side",
                duration: "30s",
                instruction: "Repeat on the left side. Keep your shoulders down and relaxed.",
                image: "assets/illustrations/steps/neck-release-2.png"
            },
            {
                subtitle: "Forward",
                duration: "30s",
                instruction: "Interlace fingers behind your head and gently pull your chin to your chest.",
                image: "assets/illustrations/steps/neck-release-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "seated-twist",
        title: "Seated Spinal Twist",
        category: "Sitting",
        description: "A rotational movement to mobilize the thoracic spine and reduce lower back stiffness.",
        benefit: "Improves spinal mobility and digestion.",
        icon: "🔄",
        illustration: "assets/illustrations/seated-twist.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "5s",
                instruction: "Sit sideways in your chair or ensuring you have room to turn.",
                image: "assets/illustrations/steps/seated-twist-1.png"
            },
            {
                subtitle: "Twist Right",
                duration: "30s",
                instruction: "Inhale to lengthen spine, exhale to twist right, holding the chair back.",
                image: "assets/illustrations/steps/seated-twist-2.png"
            },
            {
                subtitle: "Twist Left",
                duration: "30s",
                instruction: "Repeat on the other side. Don't force the twist; move with your breath.",
                image: "assets/illustrations/steps/seated-twist-3.png"
            }
        ],
        options: ["Sitting"]
    },
    {
        id: "seated-pigeon",
        title: "Seated Figure-4",
        category: "Sitting",
        description: "A hip opener that targets the glutes and piriformis, often tight from prolonged sitting.",
        benefit: "Reduces sciatica risk and hip tightness.",
        icon: "🦵",
        illustration: "assets/illustrations/seated-pigeon.png",
        workout: [
            {
                subtitle: "Cross Leg",
                duration: "10s",
                instruction: "Cross your right ankle over your left knee.",
                image: "assets/illustrations/steps/seated-pigeon-1.png"
            },
            {
                subtitle: "Lean",
                duration: "45s",
                instruction: "Keep spine straight and hinge forward at the hips until you feel a stretch in the right glute.",
                image: "assets/illustrations/steps/seated-pigeon-2.png"
            },
            {
                subtitle: "Switch",
                duration: "45s",
                instruction: "Switch legs and repeat on the left side.",
                image: "assets/illustrations/steps/seated-pigeon-3.png"
            }
        ],
        options: ["Sitting"]
    },
    {
        id: "wrist-relief",
        title: "Wrist & Forearm Relief",
        category: "Sitting",
        description: "Essential stretches for preventing Carpal Tunnel and relieving typing fatigue.",
        benefit: "Prevents wrist strain and carpal tunnel.",
        icon: "🤲",
        illustration: "assets/illustrations/wrist-relief.png",
        workout: [
            {
                subtitle: "Flexion",
                duration: "30s",
                instruction: "Extend arm, palm facing down. Gently pull fingers back towards you.",
                image: "assets/illustrations/steps/wrist-relief-1.png"
            },
            {
                subtitle: "Extension",
                duration: "30s",
                instruction: "Flip palm to face you, fingers down. Gently pull hand towards you.",
                image: "assets/illustrations/steps/wrist-relief-2.png"
            },
            {
                subtitle: "Rotations",
                duration: "20s",
                instruction: "Clasp hands and roll wrists in figure-8 motions.",
                image: "assets/illustrations/steps/wrist-relief-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "cat-cow-seated",
        title: "Seated Cat-Cow",
        category: "Sitting",
        description: "Fluid spinal movement to lubricate vertebrae and release back tension.",
        benefit: "Increases spinal flexibility.",
        icon: "🐈",
        illustration: "assets/illustrations/cat-cow.png",
        workout: [
            {
                subtitle: "Cow Pose",
                duration: "5s",
                instruction: "Inhale, arch your back, lift your chest, look up.",
                image: "assets/illustrations/steps/cat-cow-1.png"
            },
            {
                subtitle: "Cat Pose",
                duration: "5s",
                instruction: "Exhale, round your spine, tuck your chin to chest.",
                image: "assets/illustrations/steps/cat-cow-2.png"
            },
            {
                subtitle: "Flow",
                duration: "60s",
                instruction: "Repeat the cycle slowly with your breath.",
                image: "assets/illustrations/steps/cat-cow-3.png"
            }
        ],
        options: ["Sitting"]
    },

    // --- STANDING CATEGORY ---
    {
        id: "standing-stretch",
        title: "The 'Anti-Sit' Stretch",
        category: "Standing",
        description: "A full body extension to reverse the folded posture of sitting.",
        benefit: "Energizes the whole body.",
        icon: "🧍",
        illustration: "assets/illustrations/standing-stretch.png",
        workout: [
            {
                subtitle: "Reach",
                duration: "15s",
                instruction: "Stand up. Reach arms overhead, interlace fingers, palms up.",
                image: "assets/illustrations/steps/standing-stretch-1.png"
            },
            {
                subtitle: "Lean Right",
                duration: "15s",
                instruction: "Lean gently to the right, stretching the left side body.",
                image: "assets/illustrations/steps/standing-stretch-2.png"
            },
            {
                subtitle: "Lean Left",
                duration: "15s",
                instruction: "Lean gently to the left.",
                image: "assets/illustrations/steps/standing-stretch-3.png"
            },
            {
                subtitle: "Backbend",
                duration: "15s",
                instruction: "Gently lean back, opening the chest to the ceiling.",
                image: "assets/illustrations/steps/standing-stretch-4.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "doorway-pec-stretch",
        title: "Doorway Chest Opener",
        category: "Standing",
        description: "Uses a doorframe to deeply stretch the pectoral muscles.",
        benefit: "Counteracts hunching and rounded shoulders.",
        icon: "🚪",
        illustration: "assets/illustrations/doorway-stretch.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "10s",
                instruction: "Find a doorframe. Place forearms on either side at shoulder height.",
                image: "assets/illustrations/steps/doorway-1.png"
            },
            {
                subtitle: "Lean",
                duration: "45s",
                instruction: "Step one foot through and lean chest forward until you feel a stretch.",
                image: "assets/illustrations/steps/doorway-2.png"
            },
            {
                subtitle: "Release",
                duration: "10s",
                instruction: "Step back slowly and shake out arms.",
                image: "assets/illustrations/steps/doorway-3.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "hamstring-hang",
        title: "Forward Fold Hang",
        category: "Standing",
        description: "A passive inversion to release the lower back and hamstrings.",
        benefit: "Decompresses the spine.",
        icon: "🎋",
        illustration: "assets/illustrations/forward-fold.png",
        workout: [
            {
                subtitle: "Fold",
                duration: "10s",
                instruction: "Stand feet hip-width apart. Bend knees slightly and fold forward at hips.",
                image: "assets/illustrations/steps/fold-1.png"
            },
            {
                subtitle: "Hang",
                duration: "45s",
                instruction: "Let head and arms hang heavy. Hold opposite elbows (Ragdoll).",
                image: "assets/illustrations/steps/fold-2.png"
            },
            {
                subtitle: "Rise",
                duration: "15s",
                instruction: "Roll up to standing one vertebra at a time, head comes up last.",
                image: "assets/illustrations/steps/fold-3.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "desk-plank",
        title: "Desk Plank",
        category: "Standing",
        description: "Engages the core using your desk for support.",
        benefit: "Wakes up the core stabilizers.",
        icon: "🪵",
        illustration: "assets/illustrations/desk-plank.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "10s",
                instruction: "Place hands on edge of desk, step feet back until body is in a straight line.",
                image: "assets/illustrations/steps/plank-1.png"
            },
            {
                subtitle: "Hold",
                duration: "45s",
                instruction: "Engage abs and glutes. Don't let hips sag. Breathe.",
                image: "assets/illustrations/steps/plank-2.png"
            }
        ],
        options: ["Standing", "Office"]
    },
    {
        id: "calve-raises",
        title: "Desk Calve Raises",
        category: "Standing",
        description: "Simple ankle pumps to improve circulation.",
        benefit: "Pumps blood from legs back to heart.",
        icon: "👠",
        illustration: "assets/illustrations/calve-raises.png",
        workout: [
            {
                subtitle: "Raise",
                duration: "30s",
                instruction: "Stand holding desk for balance. Lift heels as high as possible.",
                image: "assets/illustrations/steps/calve-1.png"
            },
            {
                subtitle: "Lower",
                duration: "30s",
                instruction: "Lower heels slowly to floor. Repeat deeply.",
                image: "assets/illustrations/steps/calve-2.png"
            }
        ],
        options: ["Standing"]
    },

    // --- EYE & MENTAL CATEGORY ---
    {
        id: "20-20-20-rule",
        title: "20-20-20 Reset",
        category: "Eye",
        description: "The gold standard for preventing digital eye strain.",
        benefit: "Reduces eye strain and fatigue.",
        icon: "👁️",
        illustration: "assets/illustrations/20-20-20.png",
        workout: [
            {
                subtitle: "Look Away",
                duration: "20s",
                instruction: "Look at something at least 20 feet away.",
                image: "assets/illustrations/steps/eye-yoga-1.png"
            },
            {
                subtitle: "Blink",
                duration: "20s",
                instruction: "Blink forcefully and slowly to relubricate eyes.",
                image: "assets/illustrations/steps/eye-yoga-2.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "palming",
        title: "Eye Palming",
        category: "Eye",
        description: "Total darkness relaxation for the optic nerve.",
        benefit: "Deep relaxation for tired eyes.",
        icon: "🙈",
        illustration: "assets/illustrations/palming.png",
        workout: [
            {
                subtitle: "Warm Up",
                duration: "10s",
                instruction: "Rub hands together vigorously to create heat.",
                image: "assets/illustrations/steps/palming-1.png"
            },
            {
                subtitle: "Cup",
                duration: "60s",
                instruction: "Cup palms over closed eyes without pressing on eyelids. Visualize black.",
                image: "assets/illustrations/steps/palming-2.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "box-breathing",
        title: "Box Breathing",
        category: "Mental",
        description: "Navy SEAL technique for instant stress reduction.",
        benefit: "Calms the nervous system immediately.",
        icon: "🌬️",
        illustration: "assets/illustrations/box-breathing.png",
        workout: [
            {
                subtitle: "Inhale",
                duration: "4s",
                instruction: "Inhale slowly through nose.",
                image: "assets/illustrations/steps/box-1.png"
            },
            {
                subtitle: "Hold",
                duration: "4s",
                instruction: "Hold breath at the top.",
                image: "assets/illustrations/steps/box-2.png"
            },
            {
                subtitle: "Exhale",
                duration: "4s",
                instruction: "Exhale slowly through mouth.",
                image: "assets/illustrations/steps/box-3.png"
            },
            {
                subtitle: "Hold",
                duration: "4s",
                instruction: "Hold breath at the bottom. Repeat cycle.",
                image: "assets/illustrations/steps/box-4.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },

    // --- EXPANDED LIBRARY (NEW) ---
    // HEAD & NECK
    {
        id: "jaw-release",
        title: "Jaw Release Massage",
        category: "Head",
        description: "Gently massage the jaw muscles to release clenching tension.",
        benefit: "Relieves stress-induced jaw tightness.",
        icon: "💆",
        illustration: "assets/illustrations/jaw-release.png",
        workout: [
            {
                subtitle: "Find Spot",
                duration: "10s",
                instruction: "Place fingers just below cheekbones where jaw opens.",
                image: "assets/illustrations/steps/jaw-1.png"
            },
            {
                subtitle: "Massage",
                duration: "45s",
                instruction: "Massage in slow circular motions. Open mouth slightly to stretch.",
                image: "assets/illustrations/steps/jaw-2.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "chin-tuck",
        title: "Chin Tucks",
        category: "Head",
        description: "Corrects forward head posture from screen use.",
        benefit: "Strengthens deep neck flexors.",
        icon: "🐢",
        illustration: "assets/illustrations/chin-tuck.png",
        workout: [
            {
                subtitle: "Tuck",
                duration: "5s",
                instruction: "Pull chin straight back like making a double chin.",
                image: "assets/illustrations/steps/chin-tuck-1.png"
            },
            {
                subtitle: "Hold",
                duration: "5s",
                instruction: "Hold the position, feeling length in back of neck.",
                image: "assets/illustrations/steps/chin-tuck-2.png"
            },
            {
                subtitle: "Repeat",
                duration: "60s",
                instruction: "Repeat for 10 reps.",
                image: "assets/illustrations/steps/chin-tuck-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "scm-stretch",
        title: "SCM Neck Stretch",
        category: "Head",
        description: "Targets the Sternocleidomastoid muscle at front of neck.",
        benefit: "Relieves referral pain to forehead and ear.",
        icon: "🦒",
        illustration: "assets/illustrations/scm-stretch.png",
        workout: [
            {
                subtitle: "Anchor",
                duration: "10s",
                instruction: "Place hands on collarbone to anchor skin down.",
                image: "assets/illustrations/steps/scm-1.png"
            },
            {
                subtitle: "Stretch",
                duration: "30s",
                instruction: "Look up and away to the left. Feel stretch in right front neck.",
                image: "assets/illustrations/steps/scm-2.png"
            },
            {
                subtitle: "Switch",
                duration: "30s",
                instruction: "Repeat on opposite side.",
                image: "assets/illustrations/steps/scm-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },

    // SHOULDERS & BACK
    {
        id: "eagle-arms",
        title: "Eagle Arms",
        category: "Shoulders",
        description: "Opens up the space between the shoulder blades.",
        benefit: "Releases upper back tension.",
        icon: "🦅",
        illustration: "assets/illustrations/eagle-arms.png",
        workout: [
            {
                subtitle: "Wrap",
                duration: "10s",
                instruction: "Wrap right arm under left. Try to touch palms.",
                image: "assets/illustrations/steps/eagle-1.png"
            },
            {
                subtitle: "Lift",
                duration: "30s",
                instruction: "Lift elbows to shoulder height. Press forearms away from face.",
                image: "assets/illustrations/steps/eagle-2.png"
            },
            {
                subtitle: "Switch",
                duration: "30s",
                instruction: "Unwrap and switch arms (Left under Right).",
                image: "assets/illustrations/steps/eagle-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "wall-angels",
        title: "Wall Angels",
        category: "Shoulders",
        description: "Active range of motion exercise for posture.",
        benefit: "Improves thoracic mobility and posture.",
        icon: "👼",
        illustration: "assets/illustrations/wall-angels.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "10s",
                instruction: "Stand with back flat against a wall. Arms in 'W' shape.",
                image: "assets/illustrations/steps/wall-angel-1.png"
            },
            {
                subtitle: "Slide",
                duration: "45s",
                instruction: "Slide arms up to 'Y' shape keeping elbows and wrists on wall. Slide back down.",
                image: "assets/illustrations/steps/wall-angel-2.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "thoracic-rotation",
        title: "Thoracic Windmill",
        category: "Back",
        description: "Opens the chest and rotates the mid-spine.",
        benefit: "Combats stiffness from hunching.",
        icon: "🌬️",
        illustration: "assets/illustrations/windmill.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "10s",
                instruction: "Stand or sit. Place right hand behind head.",
                image: "assets/illustrations/steps/windmill-1.png"
            },
            {
                subtitle: "Close",
                duration: "5s",
                instruction: "Bring right elbow towards left elbow.",
                image: "assets/illustrations/steps/windmill-2.png"
            },
            {
                subtitle: "Open",
                duration: "5s",
                instruction: "Open right elbow wide, looking up/right.",
                image: "assets/illustrations/steps/windmill-3.png"
            },
            {
                subtitle: "Reps",
                duration: "40s",
                instruction: "Perform 10 reps then switch sides.",
                image: "assets/illustrations/steps/windmill-4.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },

    // ARMS, WRISTS, HANDS
    {
        id: "prayer-stretch",
        title: "Reverse Prayer",
        category: "Arms",
        description: "Deep stretch for wrists and forearms.",
        benefit: "Relieves typing strain.",
        icon: "🙏",
        illustration: "assets/illustrations/prayer.png",
        workout: [
            {
                subtitle: "Prayer",
                duration: "30s",
                instruction: "Press palms together at chest height. Lower hands while keeping palms touching.",
                image: "assets/illustrations/steps/prayer-1.png"
            },
            {
                subtitle: "Reverse",
                duration: "30s",
                instruction: "Press backs of hands together at chest height. Lower elbows.",
                image: "assets/illustrations/steps/prayer-2.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "finger-glides",
        title: "Tendon Glides",
        category: "Hands",
        description: "Flossing for the tendons in the hand and carpal tunnel.",
        benefit: "Maintains smooth tendon movement.",
        icon: "🖐️",
        illustration: "assets/illustrations/glides.png",
        workout: [
            {
                subtitle: "Positions",
                duration: "60s",
                instruction: "Cycle through: Open Palm -> Hook Fist -> Full Fist -> Tabletop -> Straight Fist.",
                image: "assets/illustrations/steps/glides-1.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "thumb-fist",
        title: "Finkelstein Stretch",
        category: "Hands",
        description: "Specific stretch for thumb tendons (De Quervain's tenosynovitis).",
        benefit: "Relieves thumb pain from texting/mouse.",
        icon: "👍",
        illustration: "assets/illustrations/thumb-fist.png",
        workout: [
            {
                subtitle: "Tuck",
                duration: "10s",
                instruction: "Tuck thumb inside palm and make a fist over it.",
                image: "assets/illustrations/steps/thumb-1.png"
            },
            {
                subtitle: "Tilt",
                duration: "30s",
                instruction: "Gently tilt fist downward (ulnar deviation). Feel stretch on thumb side wrist.",
                image: "assets/illustrations/steps/thumb-2.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },

    // HIPS & LEGS
    {
        id: "hip-flexor-lunge",
        title: "Chair Lunge",
        category: "Legs",
        description: "Uses chair for stability to open hips.",
        benefit: "Counteracts tight hip flexors.",
        icon: "🏃",
        illustration: "assets/illustrations/chair-lunge.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "10s",
                instruction: "Stand facing away from chair. Place top of one foot on seat behind you.",
                image: "assets/illustrations/steps/lunge-1.png"
            },
            {
                subtitle: "Lower",
                duration: "40s",
                instruction: "Bend standing knee slightly until you feel a stretch in the front of the back thigh/hip.",
                image: "assets/illustrations/steps/lunge-2.png"
            },
            {
                subtitle: "Switch",
                duration: "40s",
                instruction: "Switch legs.",
                image: "assets/illustrations/steps/lunge-3.png"
            }
        ],
        options: ["Standing", "Prop Needed"]
    },
    {
        id: "seated-hamstring",
        title: "Seated Hamstring",
        category: "Legs",
        description: "Safe hamstring stretch while seated.",
        benefit: "Relieves back pain linked to tight legs.",
        icon: "🪑",
        illustration: "assets/illustrations/seated-ham.png",
        workout: [
            {
                subtitle: "Extend",
                duration: "10s",
                instruction: "Sit on edge of chair. Extend right leg straight, heel on floor.",
                image: "assets/illustrations/steps/ham-1.png"
            },
            {
                subtitle: "Hinge",
                duration: "40s",
                instruction: "Keep back straight, hinge forward at hips.",
                image: "assets/illustrations/steps/ham-2.png"
            },
            {
                subtitle: "Switch",
                duration: "40s",
                instruction: "Repeat on left leg.",
                image: "assets/illustrations/steps/ham-3.png"
            }
        ],
        options: ["Sitting"]
    },
    {
        id: "glute-bridges",
        title: "Glute Activation",
        category: "Legs",
        description: "Wakes up glutes (amnesia) from sitting.",
        benefit: "Strengthens posterior chain.",
        icon: "🍑",
        illustration: "assets/illustrations/bridge.png",
        workout: [
            {
                subtitle: "Activation",
                duration: "60s",
                instruction: "Stand feet hip-width. Squeeze glutes hard for 5s, release. Repeat 10x.",
                image: "assets/illustrations/steps/glute-1.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "nerve-floss",
        title: "Sciatic Floss",
        category: "Legs",
        description: "Mobilizes the sciatic nerve.",
        benefit: "Relieves sciatic pain.",
        icon: "⚡",
        illustration: "assets/illustrations/nerve-floss.png",
        workout: [
            {
                subtitle: "Setup",
                duration: "5s",
                instruction: "Sit tall. Slump neck/shoulders down.",
                image: "assets/illustrations/steps/floss-1.png"
            },
            {
                subtitle: "Floss",
                duration: "45s",
                instruction: "Extend leg while lifting head up. Bend knee while looking down. Move continuously.",
                image: "assets/illustrations/steps/floss-2.png"
            }
        ],
        options: ["Sitting"]
    },

    // NICHE / MISC
    {
        id: "foot-roll",
        title: "Foot Roll",
        category: "Feet",
        description: "Self-massage for feet using a ball/bottle.",
        benefit: "Relieves plantar fasciitis.",
        icon: "🎾",
        illustration: "assets/illustrations/foot-roll.png",
        workout: [
            {
                subtitle: "Roll",
                duration: "60s",
                instruction: "Step on a tennis ball or water bottle. Roll it under your arch.",
                image: "assets/illustrations/steps/foot-1.png"
            }
        ],
        options: ["Standing", "Sitting"]
    },
    {
        id: "shake-out",
        title: "Stress Shake-Out",
        category: "Whole Body",
        description: "Somatic release of tension.",
        benefit: "Resets nervous system.",
        icon: "〰️",
        illustration: "assets/illustrations/shake.png",
        workout: [
            {
                subtitle: "Wiggle",
                duration: "30s",
                instruction: "Shake hands, arms, and legs vigorously.",
                image: "assets/illustrations/steps/shake-1.png"
            },
            {
                subtitle: "Bounce",
                duration: "30s",
                instruction: "Gently bounce on your heels.",
                image: "assets/illustrations/steps/shake-2.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "lion-breath",
        title: "Lion's Breath",
        category: "Mental",
        description: "Relieves facial tension and stress.",
        benefit: "Fun, instant stress release.",
        icon: "🦁",
        illustration: "assets/illustrations/lion.png",
        workout: [
            {
                subtitle: "Inhale",
                duration: "3s",
                instruction: "Inhale deeply through nose.",
                image: "assets/illustrations/steps/lion-1.png"
            },
            {
                subtitle: "Exhale",
                duration: "5s",
                instruction: "Open mouth wide, stick out tongue, exhale with a 'HA' sound. Look up with eyes.",
                image: "assets/illustrations/steps/lion-2.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    // --- BONUS EXERCISES ---
    {
        id: "scapular-retractions",
        title: "Scapular Squeezes",
        category: "Back",
        description: "Isolates the muscles between shoulder blades.",
        benefit: "Fixes rounded shoulders.",
        icon: "🥜",
        illustration: "assets/illustrations/scapular.png",
        workout: [
            {
                subtitle: "Squeeze",
                duration: "5s",
                instruction: "Imagine squeezing a pencil between your shoulder blades. Shoulders down.",
                image: "assets/illustrations/steps/scap-1.png"
            },
            {
                subtitle: "Release",
                duration: "5s",
                instruction: "Release to neutral. Do not round forward.",
                image: "assets/illustrations/steps/scap-2.png"
            },
            {
                subtitle: "Repeat",
                duration: "60s",
                instruction: "Perform 10-15 reps.",
                image: "assets/illustrations/steps/scap-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "neck-isometrics",
        title: "Neck Isometrics",
        category: "Head",
        description: "Strengthens neck muscles without movement.",
        benefit: "Builds neck stability.",
        icon: "🗿",
        illustration: "assets/illustrations/iso-neck.png",
        workout: [
            {
                subtitle: "Front Press",
                duration: "10s",
                instruction: "Press palm against forehead. Push head into hand without moving.",
                image: "assets/illustrations/steps/iso-1.png"
            },
            {
                subtitle: "Side Press",
                duration: "10s",
                instruction: "Press hand against side of head. Push head into hand.",
                image: "assets/illustrations/steps/iso-2.png"
            },
            {
                subtitle: "Back Press",
                duration: "10s",
                instruction: "Clasp hands behind head. Push head back into hands.",
                image: "assets/illustrations/steps/iso-3.png"
            }
        ],
        options: ["Sitting", "Standing"]
    },
    {
        id: "star-reach",
        title: "Star Reach",
        category: "Whole Body",
        description: "Expands the body in all directions.",
        benefit: "Energizes and opens fascia.",
        icon: "⭐",
        illustration: "assets/illustrations/star.png",
        workout: [
            {
                subtitle: "Expand",
                duration: "10s",
                instruction: "Stand feet wide. Reach arms up and out in a Y shape.",
                image: "assets/illustrations/steps/star-1.png"
            },
            {
                subtitle: "Stretch",
                duration: "20s",
                instruction: "Reach through fingertips and toes. Take up space!",
                image: "assets/illustrations/steps/star-2.png"
            }
        ],
        options: ["Standing"]
    },
    {
        id: "seated-march",
        title: "Seated March",
        category: "Legs",
        description: "Active movement for hip flexors while seated.",
        benefit: "Keeps hip flexors active.",
        icon: "🥁",
        illustration: "assets/illustrations/march.png",
        workout: [
            {
                subtitle: "Lift Right",
                duration: "2s",
                instruction: "Sit tall. Lift right knee as high as possible.",
                image: "assets/illustrations/steps/march-1.png"
            },
            {
                subtitle: "Lift Left",
                duration: "2s",
                instruction: "Lower and lift left knee.",
                image: "assets/illustrations/steps/march-2.png"
            },
            {
                subtitle: "March",
                duration: "60s",
                instruction: "Continue alternating in a marching rhythm.",
                image: "assets/illustrations/steps/march-3.png"
            }
        ],
        options: ["Sitting"]
    }
];
