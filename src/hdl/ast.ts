import { IDictionary, Range } from "../internal";

import { strict as assert } from "assert";
import { bitsFor } from "../util";

/**
 * @internal
 * Deterministic Unique Identifier.
 * 
 * A monotonically increasing ID.
 */
class DUID {
    private static __next = 0n;

    /**
     * The ID this `DUID` instance represents
     */
    public value: bigint;

    /**
     * Constructs a new `DUID`
     */
    constructor() {
        this.value = DUID.__next;
        DUID.__next++;
    }
}

type ShapeCastFrom = Shape | number | [number, boolean] | Range | IDictionary<number>;
type ShapeCompareTo = Shape | [number, boolean];

/** Bit width and signedness of a signal. */
class Shape {
    /** The bit width of the signal this `Shape` represents */
    public width: number;
    /** Whether the signal represents a signed value or not */
    public signed: boolean;

    /**
     * @param width The bit width of the signal this `Shape` represents
     * @param signed Whether the signal represents a signed value or not
     * 
     * @default
     * signed: false
     */
    constructor(width: number, signed = false) {
        assert(width >= 1, "Shape must be non-negative and non-zero.");
        this.width = width;
        this.signed = signed;
    }

    /**
     * Constructs a signed `Shape` from a width.
     * 
     * @param width The bit width of the signal this `Shape` represents
     */
    static signed(width: number): Shape {
        return new Shape(width, true);
    }
    /**
     * Constructs an unsigned `Shape` from a width.
     * 
     * @param width The bit width of the signal this `Shape` represents
     */
    static unsigned(width: number): Shape {
        return new Shape(width, false);
    }

    /**
     * Constructs a `Shape` from another compatible object
     * 
     * @param obj The object to convert into a `Signal`
     * 
     * @remarks
     * When given a `Shape`, a duplicate `Shape` object will be returned.
     * 
     * When given a `number` an unsigned `Shape` object will be created with the `width` of the provided `obj`.
     * 
     * When given a tuple of `[number, boolean]`, those values will be used as the `width` and `signed` parameters when creating the `Shape` object.
     * 
     * When given a `Range` object, a `Shape` object will be created with `width` and `signed` values needed to hold every possible value.
     * 
     * When given an `IDictionary<number>`, a `Shape` object will be created with `width` and `signed` values needed to hold every possible value.
     */
    static cast(obj: ShapeCastFrom): Shape {
        if (obj instanceof Shape)
            return new Shape(obj.width, obj.signed);

        if (typeof obj === "number")
            return Shape.unsigned(obj);

        // Tuple<number, boolean>
        if (Array.isArray(obj))
            return new Shape(obj[0], obj[1]);

        if (obj instanceof Range) {
            const signed = obj.start < 0 || (obj.stop - obj.step) < 0;
            const width = Math.max(
                bitsFor(obj.start, signed),
                bitsFor(obj.stop - obj.step, signed)
            );
            return new Shape(width, signed);
        }

        const min = Math.min(...Object.values(obj));
        const max = Math.min(...Object.values(obj));
        const signed = min < 0 || max < 0;
        const width = Math.max(
            bitsFor(min, signed),
            bitsFor(max, signed)
        );
        return new Shape(width, signed);
    }

    toString(): string {
        if (this.signed)
            return `Shape.signed{${this.width}}`;
        return `Shape.unsigned{${this.width}}`;
    }

    equals(other: ShapeCompareTo): boolean {
        if (Array.isArray(other))
            return (this.width === other[0]) && (this.signed === other[1]);

        return (this.width === other.width) && (this.signed === other.signed);
    }
}

export { DUID, Shape };
