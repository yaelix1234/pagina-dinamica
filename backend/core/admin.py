from django.contrib import admin
from .models import Usuario, Categoria, Producto, Cliente, Pedido, DetallePedido


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'correo', 'cargo', 'estado', 'fecha_creacion']
    search_fields = ['nombre', 'correo']


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'fecha_creacion']
    search_fields = ['nombre']


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'categoria', 'precio', 'existencias', 'estado']
    list_filter = ['categoria', 'estado']
    search_fields = ['nombre']


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nombre_completo', 'telefono', 'correo', 'fecha_registro']
    search_fields = ['nombre_completo', 'correo']


class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 1
    readonly_fields = ['subtotal']


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'total', 'estado', 'fecha']
    list_filter = ['estado', 'metodo_pago']
    inlines = [DetallePedidoInline]


@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = ['pedido', 'producto', 'cantidad', 'subtotal']