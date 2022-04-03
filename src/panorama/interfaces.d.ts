interface PanelBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

interface OnGlobalValueChanged {
	name: keyof CustomUIConfig;
}

interface GameEventDeclarations {
	on_global_value_changed: OnGlobalValueChanged;
}

type Vector = [number, number, number];
type PanoramaVector = { x: number; y: number };
